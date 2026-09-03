#!/usr/bin/env python3
"""generate_sot.py - render tool/sound-of-text/*.md to static HTML.

Reads front-matter + Markdown body from each .md under tool/sound-of-text/,
substitutes a subset of Jekyll/Liquid syntax, and emits a static HTML page
into sound-of-text/<slug>/index.html using _layouts/sot.html.

Supported Liquid subset (matches actual usage in this repo):
  {{ var }}                          page.*, site.*, content, forloop.last, f.*
  {{ var | filter }}                  relative_url, jsonify
  {{ var | filter:arg }}              split, default
  {{ var | f1 | f2:arg | f3 }}        chained filters
  {% if EXPR %}...{% endif %}         truthy check
  {% unless EXPR %}...{% endunless %} falsy check
  {% for X in EXPR %}body{% endfor %} loop with forloop.last

Usage:
  python generate_sot.py [--dry-run] [--only SLUG] [--src DIR] [--out DIR]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import markdown
import yaml

ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG = ROOT / "_config.yml"
DEFAULT_LAYOUT = ROOT / "_layouts" / "sot.html"
DEFAULT_SRC = ROOT / "tool" / "sound-of-text"
# Output base is the repo root; the full permalink is appended so that
#   /sound-of-text/             -> <root>/sound-of-text/index.html
#   /sound-of-text/indonesian/  -> <root>/sound-of-text/indonesian/index.html
DEFAULT_OUT = ROOT

# Filled at runtime from _config.yml
SITE_URL = ""


# ----------------------------- helpers ------------------------------------

def parse_front_matter(text: str) -> tuple:
    """Split YAML front matter from Markdown body."""
    if not text.startswith("---"):
        raise ValueError("File does not start with front matter delimiter")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if not m:
        raise ValueError("Front matter delimiter not closed")
    fm = yaml.safe_load(m.group(1)) or {}
    return fm, m.group(2)


def split_filter_token(token: str) -> tuple:
    """Parse 'filter' or 'filter:arg' (arg may be quoted)."""
    token = token.strip()
    m = re.match(r"^([A-Za-z_]\w*)\s*:\s*(.*)$", token, re.DOTALL)
    if not m:
        return token, None
    name, arg = m.group(1), m.group(2).strip()
    if len(arg) >= 2 and arg[0] == arg[-1] and arg[0] in ("'", '"'):
        arg = arg[1:-1]
    return name, arg


def resolve_variable(expr: str, ctx: dict):
    expr = expr.strip()
    # Liquid string literal: 'foo' or "foo"
    if len(expr) >= 2 and expr[0] == expr[-1] and expr[0] in ("'", '"'):
        return expr[1:-1]
    if expr == "content":
        return ctx.get("content")
    if expr == "site.url":
        return ctx["site"].get("url")
    if expr == "forloop.last":
        return bool(ctx.get("forloop_last"))
    if expr.startswith("page."):
        return ctx["page"].get(expr[5:])
    if expr.startswith("f."):
        f = ctx.get("f")
        if isinstance(f, dict):
            return f.get(expr[2:])
        return None
    return expr


def apply_filter(value, name: str, arg):
    if name == "relative_url":
        base = SITE_URL.rstrip("/")
        s = "" if value is None else str(value)
        if not s.startswith("/"):
            s = "/" + s
        return base + s
    if name == "jsonify":
        return json.dumps("" if value is None else str(value), ensure_ascii=False)
    if name == "split":
        if arg is None or value is None:
            return []
        return str(value).split(arg)
    if name == "first":
        if isinstance(value, (list, tuple, str)) and len(value):
            return value[0]
        return value
    if name == "default":
        if value is None or (isinstance(value, str) and value == ""):
            return arg
        return value
    raise ValueError(f"Unknown Liquid filter: {name}")


def resolve_expression(expr: str, ctx: dict):
    parts = [p.strip() for p in expr.split("|")]
    value = resolve_variable(parts[0], ctx)
    for filt in parts[1:]:
        fname, farg = split_filter_token(filt)
        value = apply_filter(value, fname, farg)
    return value


def _truthy(expr: str, ctx: dict) -> bool:
    expr = expr.strip()
    if expr == "forloop.last":
        return bool(ctx.get("forloop_last"))
    val = resolve_variable(expr, ctx)
    if isinstance(val, (list, dict, str)):
        return bool(val)
    return bool(val)


# ------------------------- tag renderers ---------------------------------

_VAR_RE = re.compile(r"\{\{\s*(.+?)\s*\}\}", re.DOTALL)
_FOR_RE = re.compile(
    r"\{%\s*for\s+(\w+)\s+in\s+(\S+?)\s*%\}(.*?)\{%\s*endfor\s*%\}",
    re.DOTALL,
)
_IF_RE = re.compile(
    r"\{%\s*if\s+(\S+?)\s*%\}(.*?)\{%\s*endif\s*%\}",
    re.DOTALL,
)
_UNLESS_RE = re.compile(
    r"\{%\s*unless\s+(\S+?)\s*%\}(.*?)\{%\s*endunless\s*%\}",
    re.DOTALL,
)


def _resolve_iter(expr: str, ctx: dict):
    expr = expr.strip()
    val = resolve_variable(expr, ctx)
    return val or []


def _render_vars(template: str, ctx: dict) -> str:
    def repl(m):
        try:
            val = resolve_expression(m.group(1), ctx)
            if isinstance(val, (list, tuple)):
                val = val[0] if val else ""
            return "" if val is None else str(val)
        except Exception as e:  # noqa: BLE001
            return f"<!--LIQUID-ERR:{e}-->"

    return _VAR_RE.sub(repl, template)


def _render_unless(template: str, ctx: dict) -> str:
    def repl(m):
        cond, body = m.group(1), m.group(2)
        return "" if _truthy(cond, ctx) else _render_vars(body, ctx)

    return _UNLESS_RE.sub(repl, template)


def _render_for(template: str, ctx: dict) -> str:
    out = []
    pos = 0
    while True:
        m = _FOR_RE.search(template, pos)
        if not m:
            out.append(template[pos:])
            break
        out.append(template[pos : m.start()])
        var, iter_expr, body = m.group(1), m.group(2), m.group(3)
        items = _resolve_iter(iter_expr, ctx) or []
        rendered = []
        for idx, item in enumerate(items):
            sub_ctx = dict(ctx)
            sub_ctx[var] = item
            sub_ctx["forloop_last"] = idx == len(items) - 1
            inner = _render_unless(body, sub_ctx)
            inner = _render_vars(inner, sub_ctx)
            rendered.append(inner)
        out.append("".join(rendered))
        pos = m.end()
    return "".join(out)


def _render_if(template: str, ctx: dict) -> str:
    out = []
    pos = 0
    while True:
        m = _IF_RE.search(template, pos)
        if not m:
            out.append(template[pos:])
            break
        out.append(template[pos : m.start()])
        cond, body = m.group(1), m.group(2)
        rendered_body = _render_for(body, ctx)
        rendered_body = _render_unless(rendered_body, ctx)
        rendered_body = _render_vars(rendered_body, ctx)
        out.append(rendered_body if _truthy(cond, ctx) else "")
        pos = m.end()
    return "".join(out)


def render_liquid(template: str, ctx: dict) -> str:
    """Top-level Liquid renderer (handles nested if > for > unless > vars)."""
    t = template
    t = _render_if(t, ctx)
    t = _render_for(t, ctx)
    t = _render_unless(t, ctx)
    t = _render_vars(t, ctx)
    return t


# -------------------------- main pipeline --------------------------------

def load_config(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def render_markdown(md_text: str) -> str:
    md = markdown.Markdown(
        extensions=["extra", "sane_lists"],
        output_format="html",
    )
    return md.convert(md_text)


def output_path_for(permalink: str, out_dir: Path) -> Path:
    p = (permalink or "/").strip().lstrip("/")
    if not p:
        return out_dir / "index.html"
    if p.endswith("/"):
        return out_dir / (p + "index.html")
    return out_dir / (p + "/index.html")


def render_one(md_path: Path, layout: str, site: dict, out_dir: Path, *, dry: bool):
    raw = md_path.read_text(encoding="utf-8")
    fm, body_md = parse_front_matter(raw)
    ctx = {"page": fm, "site": site, "f": {}, "forloop_last": False}

    # 1. resolve Liquid in body text first
    body_resolved = render_liquid(body_md, ctx)
    # 2. then render markdown to HTML
    body_html = render_markdown(body_resolved)
    ctx["content"] = body_html

    # 3. render the layout
    page_html = render_liquid(layout, ctx)

    target = output_path_for(fm.get("permalink", ""), out_dir)

    if not dry:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page_html, encoding="utf-8")

    return target, page_html, fm, body_resolved, body_html


# ------------------------------ CLI ---------------------------------------

def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--dry-run", action="store_true", help="Do not write files")
    p.add_argument("--only", help="Render only this slug (filename without .md)")
    p.add_argument("--src", default=str(DEFAULT_SRC), help="Source dir of .md files")
    p.add_argument("--out", default=str(DEFAULT_OUT), help="Output base dir")
    p.add_argument("--layout", default=str(DEFAULT_LAYOUT))
    p.add_argument("--config", default=str(DEFAULT_CONFIG))
    args = p.parse_args(argv)

    # Ensure console can print non-Latin titles on Windows (cp1252 etc.)
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # noqa: BLE001
        pass

    global SITE_URL
    config = load_config(Path(args.config))
    SITE_URL = (config.get("url") or "").rstrip("/")
    if not SITE_URL:
        print("ERROR: site.url missing from _config.yml", file=sys.stderr)
        return 2

    layout = Path(args.layout).read_text(encoding="utf-8")
    src = Path(args.src)
    out = Path(args.out)
    if not src.is_dir():
        print(f"ERROR: src dir not found: {src}", file=sys.stderr)
        return 2

    md_files = sorted(src.glob("*.md"))
    if args.only:
        md_files = [f for f in md_files if f.stem == args.only]
    if not md_files:
        print("No .md files matched.", file=sys.stderr)
        return 1

    print(f"Site URL: {SITE_URL}")
    print(f"Src:      {src}")
    print(f"Out:      {out}{'  (DRY-RUN)' if args.dry_run else ''}")
    print(f"Layout:   {args.layout}")
    print(f"Files:    {len(md_files)}")
    print("-" * 90)
    print(f"{'SLUG':<20} {'LANG':<10} {'TITLE':<55} BYTES")
    print("-" * 90)

    n_ok, n_err = 0, 0
    sample_target = None
    sample_html = None
    for md in md_files:
        try:
            target, html_text, fm, _, _ = render_one(
                md, layout, config, out, dry=args.dry_run
            )
            title = (fm.get("title") or "")[:53]
            lang = fm.get("lang_code") or ""
            slug = (
                (fm.get("permalink") or "")
                .rstrip("/")
                .rsplit("/", 1)[-1]
                or md.stem
            )
            print(f"{slug:<20} {lang:<10} {title:<55} {len(html_text):>6}")
            if not args.dry_run:
                if "{{" in html_text or "{%" in html_text:
                    print(f"  WARN: residual Liquid in {target}")
                for asset in re.findall(r'(?:href|src)="(/[^"]+)"', html_text):
                    p_asset = ROOT / asset.lstrip("/")
                    if not p_asset.exists():
                        print(f"  WARN: missing asset referenced -> {asset}")
            if sample_html is None:
                sample_target, sample_html = target, html_text
            n_ok += 1
        except Exception as e:  # noqa: BLE001
            n_err += 1
            print(f"ERROR rendering {md.name}: {e}")

    print("-" * 90)
    print(f"Done. ok={n_ok} err={n_err} dry-run={args.dry_run}")
    if sample_target and sample_html is not None and not args.dry_run:
        print(f"\nSample: {sample_target}")
        print(f"  size: {len(sample_html)} bytes")
        print(f"  contains FAQ section: {'sot-faq' in sample_html}")
        print(f"  contains widget:      {'sound-of-text' in sample_html}")
        print(f"  contains JSON-LD:     {'application/ld+json' in sample_html}")
    return 0 if n_err == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
