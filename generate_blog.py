import os
import zipfile
import re
import html
import shutil
import xml.etree.ElementTree as ET

ns = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def to_cdn_content_url(filename):
    clean_name = filename.replace(' ', '-').lower()
    return f"https://cdn.emzeth.com/sot/{clean_name}"

def to_cdn_cover_url(filename):
    clean_name = filename.replace(' ', '-').lower()
    return f"https://cdn.emzeth.com/sot/cover/{clean_name}"

ARTICLES_DATA = [
    {
        'file': '1. 5 platform voice over ternama di indonesia.docx',
        'slug': '5-platform-voice-over-ternama-indonesia',
        'title': '5 Platform Voice Over Ternama di Indonesia',
        'category': 'Voice Over',
        'date': '15 Juli 2025',
        'read_time': '4 min read',
        'meta_desc': 'Ulasan 5 platform voice over ternama dan terpopuler di Indonesia untuk voice talent profesional, pembuatan iklan, video YouTube, dan narasi.',
        'cover_image': 'rekam suara menggunakan voice recorder online.jpg',
        'cover_alt': 'Platform Voice Over Ternama di Indonesia',
        'content_images': [
            {'name': 'ada 6 pilihan suara cewek natural bahasa indonesia.jpg', 'alt': 'Pilihan Karakter Suara Voice Over Natural', 'caption': 'Pilihan variasi karakter suara narator profesional', 'after_heading': 'Mengulas Platform Voice Over di Indonesia'},
            {'name': 'pilih voice dengan label male untuk buat suara cowok ganteng.jpg', 'alt': 'Talent Suara Voice Over Pria Indonesia', 'caption': 'Platform voice over menyediakan talent profesional pria dan wanita', 'after_heading': 'Inavoice'}
        ],
        'internal_links': [
            {'keyword': 'voice over', 'url': '../aplikasi-text-to-speech-indonesia-terbaik/'},
            {'keyword': 'voice talent', 'url': '../voicemaker-suara-google-pria-wanita-bayi/'},
            {'keyword': 'bahasa Indonesia', 'url': '../cara-buat-sound-of-text-wa-di-hp/'}
        ]
    },
    {
        'file': '1._link_download_nada_dering_wa.docx',
        'slug': 'kumpulan-link-download-nada-dering-wa',
        'title': 'Kumpulan Link Download Nada Dering WA (Lengkap 128+ Sound)',
        'category': 'Ringtone WA',
        'date': '20 Juli 2025',
        'read_time': '8 min read',
        'meta_desc': 'Daftar link download nada dering WA aesthetic, lucu, keren, viral TikTok, anime, game dan lainnya lengkap dengan durasi singkat untuk semua HP.',
        'cover_image': 'Cara Sound of Text WA Buat Nada Dering Bahasa Indonesia.jpg',
        'cover_alt': 'Kumpulan Link Download Nada Dering WhatsApp',
        'content_images': [
            {'name': 'sound of text game mobile legend.jpg', 'alt': 'Nada Dering Game WhatsApp', 'caption': 'Kumpulan nada dering efek game favorit untuk WhatsApp', 'after_heading': 'Nada Dering WA Mobile Legends'},
            {'name': 'sound of text doraemon di myinstants.jpg', 'alt': 'Sound of Text Lucu Doraemon', 'caption': 'Nada dering karakter lucu dan kartun populer', 'after_heading': 'Nada Dering WA Humor'},
            {'name': 'pasang nada dering sound of text.jpg', 'alt': 'Cara Pasang Nada Dering WhatsApp', 'caption': 'Langkah mudah memasang ringtone hasil download ke WhatsApp', 'after_heading': 'Nada Dering WA Harvest Moon Kalem'}
        ],
        'internal_links': [
            {'keyword': 'nada dering WA', 'url': '../cara-buat-nada-dering-suara-google/'},
            {'keyword': 'nada dering WhatsApp', 'url': '../cara-sound-tiktok-jadi-nada-dering-wa/'},
            {'keyword': 'pesan masuk', 'url': '../cara-ubah-nada-pesan-masuk-whatsapp/'}
        ]
    },
    {
        'file': '2. botika buat ringtone whatsapp nama sendiri.docx',
        'slug': 'botika-buat-ringtone-whatsapp-nama-sendiri',
        'title': 'Botika: Buat Ringtone Whatsapp Nama Sendiri',
        'category': 'Tutorial TTS',
        'date': '24 Juli 2025',
        'read_time': '5 min read',
        'meta_desc': 'Cara membuat ringtone WhatsApp sebut nama sendiri dengan Botika Text to Speech bahasa Indonesia yang natural dan jernih.',
        'cover_image': 'buat nada dering iphone ada namanya saat telepon masuk.jpg',
        'cover_alt': 'Botika Text to Speech Buat Ringtone Nama Sendiri',
        'content_images': [
            {'name': 'variasi suara google wanita di botika.jpg', 'alt': 'Variasi Suara Botika TTS', 'caption': 'Pilihan suara natural formal dan santai di Botika', 'after_heading': 'Apa Itu Botika?'},
            {'name': 'buat tulisan nada dering wa sebut nama.jpg', 'alt': 'Ketik Kalimat Ringtone Sebut Nama', 'caption': 'Mengetik teks nama sendiri untuk diubah menjadi audio MP3', 'after_heading': 'Cara Buat Ringtone Whatsapp Nama Sendiri Menggunakan Botika'}
        ],
        'internal_links': [
            {'keyword': 'nama sendiri', 'url': '../cara-download-nada-dering-sebut-nama-kontak/'},
            {'keyword': 'Text to Speech', 'url': '../freetts-buat-nada-dering-whatsapp-ada-namanya/'},
            {'keyword': 'Google Translate', 'url': '../cara-buat-sound-of-text-wa-di-hp/'}
        ]
    },
    {
        'file': '2.+cara+buat+nada+dering+dengan+suara+Google.docx',
        'slug': 'cara-buat-nada-dering-suara-google',
        'title': 'Cara Buat Nada Dering dengan Suara Google',
        'category': 'Tutorial Ringtone',
        'date': '26 Juli 2025',
        'read_time': '5 min read',
        'meta_desc': 'Panduan praktis cara membuat nada dering WhatsApp dengan suara Google di Android dan iPhone tanpa aplikasi tambahan.',
        'cover_image': 'nada dering iphone ada namanya saat telepon masuk.jpg',
        'cover_alt': 'Cara Buat Nada Dering Suara Google',
        'content_images': [
            {'name': 'buat nada dering wa ada namanya di sound of text.jpg', 'alt': 'Buat Nada Dering di Sound of Text', 'caption': 'Membuat audio suara Google unik via Sound of Text', 'after_heading': 'Cara membuat nada dering WA suara google tanpa aplikasi'},
            {'name': 'sound of text sebut nama di iphone.jpg', 'alt': 'Pasang Nada Dering di iPhone', 'caption': 'Pengaturan nada dering custom suara Google di perangkat iOS', 'after_heading': 'Cara membuat nada dering suara google iPhone'}
        ],
        'internal_links': [
            {'keyword': 'suara Google', 'url': '../cara-download-suara-google-translate/'},
            {'keyword': 'nada dering WhatsApp', 'url': '../kumpulan-link-download-nada-dering-wa/'},
            {'keyword': 'Sound of Text', 'url': '../cara-membuat-suara-google-di-hp/'}
        ]
    },
    {
        'file': '2._Cara_sound_tiktok_jadi_nada_dering_wa.docx',
        'slug': 'cara-sound-tiktok-jadi-nada-dering-wa',
        'title': 'Cara Sound TikTok Jadi Nada Dering WA Pesan & Panggilan',
        'category': 'Tips WhatsApp',
        'date': '28 Juli 2025',
        'read_time': '6 min read',
        'meta_desc': 'Langkah mudah mengubah audio dan sound viral TikTok menjadi nada dering WhatsApp pesan atau panggilan di semua HP Android & iPhone.',
        'cover_image': 'fitur-wa.jpg',
        'cover_alt': 'Cara Sound TikTok Jadi Nada Dering WA',
        'content_images': [
            {'name': 'tambahkan nada dering waTikTok ke folder ringtones.jpg', 'alt': 'Simpan Audio TikTok ke Folder Ringtones', 'caption': 'Memindahkan file audio TikTok yang sudah diunduh ke folder Ringtones', 'after_heading': 'Sound TikTok jadi Nada Dering WA melalui SSSTikTok'},
            {'name': 'ganti nada dering wa dengan pilih dari file.jpg', 'alt': 'Pilih Nada Dering dari File Manager', 'caption': 'Memilih sound TikTok langsung dari menu pengaturan WhatsApp', 'after_heading': 'Mengubah Nada Dering WhatsApp'}
        ],
        'internal_links': [
            {'keyword': 'sound TikTok', 'url': '../cara-ubah-nada-pesan-masuk-whatsapp/'},
            {'keyword': 'nada dering WhatsApp', 'url': '../kumpulan-link-download-nada-dering-wa/'},
            {'keyword': 'nada dering WA', 'url': '../cara-buat-sound-of-text-wa-di-hp/'}
        ]
    },
    {
        'file': '3. voicemaker bisa buat suara google pria, wanita, hingga anak bayi.docx',
        'slug': 'voicemaker-suara-google-pria-wanita-bayi',
        'title': 'Voicemaker: Buat Suara Google Pria, Wanita, Hingga Anak Bayi',
        'category': 'Tools TTS',
        'date': '30 Juli 2025',
        'read_time': '5 min read',
        'meta_desc': 'Review fitur Voicemaker.in untuk membuat text to speech suara Google pria, wanita, hingga efek suara anak bayi yang realistis.',
        'cover_image': 'fitur fitur terbaru gb whatsapp latest version tahun 2022.jpg',
        'cover_alt': 'Voicemaker Text to Speech Generator',
        'content_images': [
            {'name': 'fitur modifikasi suara di voice maker.jpg', 'alt': 'Fitur Pengaturan Efek Suara Voicemaker', 'caption': 'Pengaturan kecepatan, pitch, volume, dan efek suara di Voicemaker', 'after_heading': 'Fitur-fitur Voicemaker'},
            {'name': 'suara bayi di situs vo codes.jpg', 'alt': 'Karakter Suara Unik Voicemaker', 'caption': 'Pilihan karakter suara unik dari bayi hingga lansia', 'after_heading': 'Voice Effects'}
        ],
        'internal_links': [
            {'keyword': 'Voice over', 'url': '../5-platform-voice-over-ternama-indonesia/'},
            {'keyword': 'teks menjadi suara', 'url': '../botika-buat-ringtone-whatsapp-nama-sendiri/'},
            {'keyword': 'text to speech', 'url': '../cara-buat-nada-dering-suara-google/'}
        ]
    },
    {
        'file': '3._Cara_buat_sound_of_text_wa_di_hp.docx',
        'slug': 'cara-buat-sound-of-text-wa-di-hp',
        'title': '8 Cara Buat Sound of Text WA di HP Online Suara Google Semua Bahasa',
        'category': 'Panduan Lengkap',
        'date': '2 Agustus 2025',
        'read_time': '7 min read',
        'meta_desc': '8 cara membuat Sound of Text WA di HP secara online dengan suara Google bahasa Indonesia, Jawa, Sunda, Korea, hingga suara anime.',
        'cover_image': 'cara terbaru menggunakan sound of text wa.jpg',
        'cover_alt': '8 Cara Buat Sound of Text WA di HP',
        'content_images': [
            {'name': 'sound of text jawa di google translate.jpg', 'alt': 'Sound of Text Bahasa Jawa', 'caption': 'Membuat audio text to speech logat bahasa daerah', 'after_heading': 'Sound of Text Bahasa Jawa'},
            {'name': 'sound of text kartun di fakeyou.jpg', 'alt': 'Sound of Text Suara Kartun & Anime', 'caption': 'Berbagai pilihan karakter suara anime dan kartun unik', 'after_heading': 'Sound of Text Anime'}
        ],
        'internal_links': [
            {'keyword': 'suara Google', 'url': '../cara-buat-nada-dering-suara-google/'},
            {'keyword': 'Text to Speech', 'url': '../freetts-buat-nada-dering-whatsapp-ada-namanya/'},
            {'keyword': 'nada dering WhatsApp', 'url': '../kumpulan-link-download-nada-dering-wa/'}
        ]
    },
    {
        'file': '4. freetts.com cara buat nada dering whatsapp ada namanya.docx',
        'slug': 'freetts-buat-nada-dering-whatsapp-ada-namanya',
        'title': 'FreeTTS.com: Cara Buat Nada Dering WhatsApp Ada Namanya',
        'category': 'Tutorial TTS',
        'date': '5 Agustus 2025',
        'read_time': '5 min read',
        'meta_desc': 'Panduan menggunakan FreeTTS.com untuk membuat nada dering WhatsApp sebut nama sendiri dengan suara jernih dan bebas limit karakter.',
        'cover_image': 'wa web.jpg',
        'cover_alt': 'FreeTTS Buat Nada Dering WhatsApp Ada Namanya',
        'content_images': [
            {'name': 'bisa pilih suara Google pria dan wanita di freetts.jpg', 'alt': 'Pilihan Suara FreeTTS', 'caption': 'Dukungan suara pria dan wanita dalam berbagai bahasa di FreeTTS', 'after_heading': 'Berkenalan dengan FreeTTS.com'},
            {'name': 'pilih file mp3 nada dering sebut nama yang telah diunduh.jpg', 'alt': 'Simpan dan Pasang File MP3 FreeTTS', 'caption': 'Mengatur file audio MP3 hasil unduhan FreeTTS sebagai ringtone WA', 'after_heading': 'Cara Pasang Nada Dering di WhatsApp'}
        ],
        'internal_links': [
            {'keyword': 'nama sendiri', 'url': '../botika-buat-ringtone-whatsapp-nama-sendiri/'},
            {'keyword': 'nada dering WhatsApp', 'url': '../cara-download-nada-dering-sebut-nama-kontak/'},
            {'keyword': 'voice talent', 'url': '../5-platform-voice-over-ternama-indonesia/'}
        ]
    },
    {
        'file': '4.+cara+download+suara+Google+Translate.docx',
        'slug': 'cara-download-suara-google-translate',
        'title': 'Cara Download Suara Google Translate Mudah (MP3)',
        'category': 'Tutorial TTS',
        'date': '8 Agustus 2025',
        'read_time': '4 min read',
        'meta_desc': 'Ketahui cara download suara Google Translate format MP3 di HP dan laptop dengan mudah tanpa aplikasi pihak ketiga.',
        'cover_image': 'google translate text to speech engine.jpg',
        'cover_alt': 'Cara Download Suara Google Translate',
        'content_images': [
            {'name': 'buat nada dering dari tulisan di google translate.jpg', 'alt': 'Download Suara Google Translate via Browser', 'caption': 'Mengambil audio Google Translate menggunakan fitur inspect network browser', 'after_heading': 'Cara download suara Google Translate di laptop'},
            {'name': 'folder downloads.jpg', 'alt': 'File MP3 di Folder Download HP', 'caption': 'File audio MP3 Google Translate tersimpan di penyimpanan perangkat', 'after_heading': 'Cara download suara Google Translate di HP'}
        ],
        'internal_links': [
            {'keyword': 'Google Translate', 'url': '../cara-membuat-suara-google-di-hp/'},
            {'keyword': 'suara Google', 'url': '../cara-buat-nada-dering-suara-google/'},
            {'keyword': 'teks menjadi suara', 'url': '../aplikasi-text-to-speech-indonesia-terbaik/'}
        ]
    },
    {
        'file': '4._Cara_download_nada_dering_sebut_nama_kontak.docx',
        'slug': 'cara-download-nada-dering-sebut-nama-kontak',
        'title': '5 Cara Download Nada Dering Sebut Nama Kontak',
        'category': 'Ringtone WA',
        'date': '10 Agustus 2025',
        'read_time': '6 min read',
        'meta_desc': 'Cara download dan pasang nada dering sebut nama kontak pemanggil WhatsApp di HP Android dan iPhone tanpa ribet.',
        'cover_image': 'GB WhatsApp Pro APK Official versi Terbaru Desember 2021.jpg',
        'cover_alt': 'Cara Download Nada Dering Sebut Nama Kontak',
        'content_images': [
            {'name': 'file mp3 nada dering sebut nama sendiri.jpg', 'alt': 'File Audio Sebut Nama Kontak', 'caption': 'Membuat rekaman suara panggilan spesifik untuk kontak tertentu', 'after_heading': 'Cara Download Nada Dering Sebut Nama Kontak Pemanggil'},
            {'name': 'cara atur custom notification kontak whatsapp tertentu.jpg', 'alt': 'Atur Custom Notification WhatsApp', 'caption': 'Pengaturan notifikasi khusus (custom ringtone) per kontak di WhatsApp', 'after_heading': 'Mengaktifkan Nada Dering Panggilan Sebut Nama Kontak'}
        ],
        'internal_links': [
            {'keyword': 'nama sendiri', 'url': '../botika-buat-ringtone-whatsapp-nama-sendiri/'},
            {'keyword': 'nada dering WA', 'url': '../kumpulan-link-download-nada-dering-wa/'},
            {'keyword': 'pesan masuk', 'url': '../cara-ubah-nada-pesan-masuk-whatsapp/'}
        ]
    },
    {
        'file': '5. 5 aplikasi voice changer terbaik untuk pc.docx',
        'slug': 'aplikasi-voice-changer-terbaik-pc',
        'title': '5 Aplikasi Voice Changer Terbaik Untuk PC Windows',
        'category': 'Software Review',
        'date': '12 Agustus 2025',
        'read_time': '5 min read',
        'meta_desc': 'Rekomendasi 5 software voice changer terbaik untuk PC Windows untuk kebutuhan gaming, streaming Discord, video editing, dan voice over.',
        'cover_image': 'situs mp3 juice yang asli dan versi terbaru tahun 2022.jpg',
        'cover_alt': 'Aplikasi Voice Changer Terbaik Untuk PC',
        'content_images': [
            {'name': 'vo codes berubah menjadi fakeyou com.jpg', 'alt': 'Voice Changer Generator Online', 'caption': 'Software pengubah suara dengan pilihan filter efek real-time', 'after_heading': 'Aplikasi Voice Changer Terbaik'},
            {'name': 'text to speech suara spongebob di uberduck.jpg', 'alt': 'Efek Suara Karakter Kartun', 'caption': 'Mengubah suara asli menjadi karakter terkenal dengan filter suara', 'after_heading': 'MorphVOX Junior'}
        ],
        'internal_links': [
            {'keyword': 'voice changer', 'url': '../voicemaker-suara-google-pria-wanita-bayi/'},
            {'keyword': 'pengubah suara', 'url': '../aplikasi-text-to-speech-indonesia-terbaik/'},
            {'keyword': 'pembuatan video', 'url': '../5-platform-voice-over-ternama-indonesia/'}
        ]
    },
    {
        'file': '5.+5+aplikasi+text+to+speech+Indonesia+terbaik.docx',
        'slug': 'aplikasi-text-to-speech-indonesia-terbaik',
        'title': '5 Aplikasi Text to Speech Indonesia Terbaik',
        'category': 'Review Aplikasi',
        'date': '14 Agustus 2025',
        'read_time': '5 min read',
        'meta_desc': 'Daftar 5 aplikasi text to speech Indonesia terbaik dengan suara natural, jernih, dan fitur lengkap untuk edukasi, konten, dan bisnis.',
        'cover_image': 'google translate text to speech engine.jpg',
        'cover_alt': 'Aplikasi Text to Speech Indonesia Terbaik',
        'content_images': [
            {'name': 'buka voiceoftext.jpg', 'alt': 'Platform Text to Speech Online', 'caption': 'Konversi naskah tulisan menjadi file audio suara manusia natural', 'after_heading': 'Aplikasi Text to Speech Indonesia Terbaik'},
            {'name': 'download suara google voice dari text dengan wideo gratis.jpg', 'alt': 'Download Audio Text to Speech Gratis', 'caption': 'Pengunduhan audio MP3 berkualitas tinggi secara instan', 'after_heading': 'Wideo'}
        ],
        'internal_links': [
            {'keyword': 'Sound of Text', 'url': '../cara-buat-sound-of-text-wa-di-hp/'},
            {'keyword': 'Text to Speech', 'url': '../voicemaker-suara-google-pria-wanita-bayi/'},
            {'keyword': 'teks menjadi suara', 'url': '../5-platform-voice-over-ternama-indonesia/'}
        ]
    },
    {
        'file': '5._cara_membuat_suara_google_di_hp.docx',
        'slug': 'cara-membuat-suara-google-di-hp',
        'title': '10 Cara Membuat Suara Google di HP (Tanpa & Pakai Aplikasi)',
        'category': 'Panduan HP',
        'date': '16 Agustus 2025',
        'read_time': '7 min read',
        'meta_desc': '10 cara mudah membuat suara Google di HP untuk voice over video TikTok, reels Instagram, dan nada notifikasi WhatsApp.',
        'cover_image': 'Cara Pakai Savefrom untuk Download YouTube.jpg',
        'cover_alt': '10 Cara Membuat Suara Google di HP',
        'content_images': [
            {'name': 'cara kirim sound of text di voice note wa.jpg', 'alt': 'Gunakan Suara Google di Pesan WA', 'caption': 'Mengirimkan pesan suara hasil text to speech ke WhatsApp', 'after_heading': 'Cara Membuat Suara Google di HP Tanpa Aplikasi'},
            {'name': 'pindahkan nada dering ke folder notifications.jpg', 'alt': 'Simpan Audio ke Notifikasi', 'caption': 'Menjadikan file suara Google sebagai nada notifikasi pesan', 'after_heading': 'Mengatur Suara Google Menjadi Nada Dering'}
        ],
        'internal_links': [
            {'keyword': 'Google Translate', 'url': '../cara-download-suara-google-translate/'},
            {'keyword': 'text to speech', 'url': '../cara-sound-tiktok-jadi-nada-dering-wa/'},
            {'keyword': 'suara Google', 'url': '../cara-ubah-nada-pesan-masuk-whatsapp/'}
        ]
    },
    {
        'file': '8. Cara Ubah Nada Pesan Masuk di Whatsapp.docx',
        'slug': 'cara-ubah-nada-pesan-masuk-whatsapp',
        'title': 'Cara Ubah Nada Pesan Masuk di WhatsApp',
        'category': 'Tips WhatsApp',
        'date': '18 Agustus 2025',
        'read_time': '3 min read',
        'meta_desc': 'Panduan lengkap cara mengubah nada pesan notifikasi masuk di WhatsApp untuk semua kontak maupun kontak tertentu secara mudah.',
        'cover_image': 'Y2Mate Cara Cepat Download Video YouTube.jpg',
        'cover_alt': 'Cara Ubah Nada Pesan Masuk di WhatsApp',
        'content_images': [
            {'name': 'pengaturan notifikasi whatsapp.jpg', 'alt': 'Menu Pengaturan Notifikasi WhatsApp', 'caption': 'Masuk ke menu Setelan WhatsApp > Notifikasi', 'after_heading': 'Cara Ubah Nada Pesan Masuk di Whatsapp'},
            {'name': 'folder notifications di file manager.jpg', 'alt': 'Folder Notifications di File Manager', 'caption': 'Memastikan audio custom tersimpan di folder Notifications perangkat', 'after_heading': 'Langkah-langkah Mengubah Nada Notifikasi'}
        ],
        'internal_links': [
            {'keyword': 'nada dering pesan', 'url': '../kumpulan-link-download-nada-dering-wa/'},
            {'keyword': 'nada dering WA', 'url': '../cara-sound-tiktok-jadi-nada-dering-wa/'},
            {'keyword': 'pesan masuk', 'url': '../cara-download-nada-dering-sebut-nama-kontak/'}
        ]
    }
]

def parse_docx(path):
    with zipfile.ZipFile(path) as z:
        num_map = {}
        if 'word/numbering.xml' in z.namelist():
            num_tree = ET.fromstring(z.read('word/numbering.xml'))
            abs_map = {}
            for abstractNum in num_tree.findall('w:abstractNum', ns):
                abs_id = abstractNum.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}abstractNumId')
                lvl = abstractNum.find('w:lvl', ns)
                numFmt = lvl.find('w:numFmt', ns) if lvl is not None else None
                fmt_val = numFmt.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', 'bullet') if numFmt is not None else 'bullet'
                abs_map[abs_id] = fmt_val
            
            for num in num_tree.findall('w:num', ns):
                num_id = num.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numId')
                absRef = num.find('w:abstractNumId', ns)
                if absRef is not None:
                    ref_id = absRef.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
                    num_map[num_id] = abs_map.get(ref_id, 'bullet')

        rels_xml = z.read('word/_rels/document.xml.rels') if 'word/_rels/document.xml.rels' in z.namelist() else None
        rel_map = {}
        if rels_xml:
            tree_rels = ET.fromstring(rels_xml)
            for rel in tree_rels:
                rel_map[rel.attrib.get('Id')] = rel.attrib.get('Target')
        
        doc_xml = z.read('word/document.xml')
        tree_doc = ET.fromstring(doc_xml)
        body = tree_doc.find('w:body', ns)
        
        blocks = []
        for elem in body:
            tag = elem.tag.split('}')[-1]
            if tag == 'p':
                pPr = elem.find('w:pPr', ns)
                pStyle = pPr.find('w:pStyle', ns) if pPr is not None else None
                style_val = pStyle.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '') if pStyle is not None else ''
                numPr = pPr.find('w:numPr', ns) if pPr is not None else None
                
                list_fmt = None
                if numPr is not None:
                    numId_el = numPr.find('w:numId', ns)
                    numId_val = numId_el.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if numId_el is not None else ''
                    list_fmt = num_map.get(numId_val, 'bullet')
                elif style_val == 'ListBullet':
                    list_fmt = 'bullet'
                elif style_val == 'ListParagraph':
                    list_fmt = 'decimal'
                
                runs = []
                for child in elem:
                    c_tag = child.tag.split('}')[-1]
                    if c_tag == 'r':
                        rPr = child.find('w:rPr', ns)
                        is_bold = rPr is not None and rPr.find('w:b', ns) is not None
                        is_italic = rPr is not None and rPr.find('w:i', ns) is not None
                        t_text = ''.join(child.itertext())
                        if t_text:
                            escaped = html.escape(t_text)
                            if is_bold: escaped = f'<strong>{escaped}</strong>'
                            if is_italic: escaped = f'<em>{escaped}</em>'
                            runs.append(escaped)
                    elif c_tag == 'hyperlink':
                        r_id = child.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                        url = rel_map.get(r_id, '#')
                        link_text = ''.join(child.itertext())
                        if link_text:
                            runs.append(f'<a href="{html.escape(url)}" target="_blank" rel="noopener noreferrer">{html.escape(link_text)}</a>')
                
                raw_text = ''.join(elem.itertext()).strip()
                html_text = ''.join(runs).strip()
                
                if raw_text.lower().startswith('meta desc') or raw_text.lower().startswith('metadeskripsi'):
                    continue
                
                if raw_text:
                    blocks.append({
                        'type': 'p',
                        'style': style_val,
                        'list_fmt': list_fmt,
                        'raw_text': raw_text,
                        'html_text': html_text
                    })
            elif tag == 'tbl':
                rows = []
                for tr in elem.findall('.//w:tr', ns):
                    cells = []
                    for tc in tr.findall('.//w:tc', ns):
                        cell_runs = []
                        hyperlinks = tc.findall('.//w:hyperlink', ns)
                        if hyperlinks:
                            for h in hyperlinks:
                                r_id = h.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                                url = rel_map.get(r_id, '#')
                                cell_runs.append(f'<a href="{html.escape(url)}" target="_blank" rel="noopener noreferrer" class="table-dl-btn"><i data-lucide="download"></i> <span>Download MP3</span></a>')
                        else:
                            for r in tc.findall('.//w:r', ns):
                                rPr = r.find('w:rPr', ns)
                                is_bold = rPr is not None and rPr.find('w:b', ns) is not None
                                t_text = ''.join(r.itertext())
                                if t_text:
                                    esc = html.escape(t_text)
                                    if is_bold: esc = f'<strong>{esc}</strong>'
                                    cell_runs.append(esc)
                        c_raw = ''.join(tc.itertext()).strip()
                        c_html = ''.join(cell_runs).strip()
                        cells.append({'raw': c_raw, 'html': c_html})
                    if cells:
                        rows.append(cells)
                if rows:
                    blocks.append({
                        'type': 'table',
                        'rows': rows,
                        'raw_text': '[Table]'
                    })
        return blocks

def apply_internal_links(content_html, links_config):
    for link_info in links_config:
        kw = link_info['keyword']
        url = link_info['url']
        
        replaced_overall = False
        def replace_in_element(match):
            nonlocal replaced_overall
            if replaced_overall:
                return match.group(0)
            elem_open = match.group(1)
            elem_body = match.group(2)
            elem_close = match.group(3)
            
            tokens = re.split(r'(<a\b[^>]*>.*?</a>)', elem_body, flags=re.DOTALL | re.IGNORECASE)
            for i in range(len(tokens)):
                if not tokens[i].startswith('<a') and not replaced_overall:
                    new_token, n = re.subn(
                        r'\b(' + re.escape(kw) + r')\b',
                        rf'<a href="{url}" class="contextual-internal-link">\1</a>',
                        tokens[i],
                        count=1,
                        flags=re.IGNORECASE
                    )
                    if n > 0:
                        tokens[i] = new_token
                        replaced_overall = True
            return elem_open + ''.join(tokens) + elem_close

        content_html = re.sub(
            r'(<(?:p|li)>)(.*?)(</(?:p|li)>)',
            replace_in_element,
            content_html,
            flags=re.DOTALL
        )
    return content_html

def generate_article_html(article, blocks, all_articles):
    toc = []
    content_html_list = []
    
    current_list_type = None  # None, 'ol', or 'ul'
    
    content_blocks = blocks[1:] if len(blocks) > 0 and (blocks[0].get('raw_text', '').strip() == article['title'] or len(blocks[0].get('raw_text', '')) < 100) else blocks
    
    img_map = {item['after_heading'].lower(): item for item in article.get('content_images', [])}
    inserted_images = set()

    total_blocks = len(content_blocks)

    for idx, b in enumerate(content_blocks):
        if b['type'] == 'table':
            if current_list_type:
                content_html_list.append(f'</{current_list_type}>')
                current_list_type = None
            
            table_rows_html = ''
            for r_idx, r in enumerate(b['rows']):
                if len(r) == 2:
                    name_cell = r[0]['html'] if r[0]['html'] else html.escape(r[0]['raw'])
                    dl_cell = r[1]['html'] if r[1]['html'] else html.escape(r[1]['raw'])
                    table_rows_html += f'''<tr>
  <td><strong>{name_cell}</strong></td>
  <td>{dl_cell}</td>
</tr>'''
                elif len(r) == 1:
                    table_rows_html += f'''<tr><td colspan="2">{r[0]['html']}</td></tr>'''
            
            content_html_list.append(f'''
<div class="download-table-wrap">
  <table class="download-table">
    <thead>
      <tr>
        <th>Nama Nada Dering</th>
        <th>File Audio</th>
      </tr>
    </thead>
    <tbody>
      {table_rows_html}
    </tbody>
  </table>
</div>''')
            continue

        raw = b['raw_text']
        html_t = b['html_text']
        style = b['style'].lower()
        list_fmt = b.get('list_fmt')
        
        # Check context of next block to see if this is an isolated tool title or part of a list
        next_block = content_blocks[idx + 1] if idx + 1 < total_blocks else None
        next_is_list = next_block and (next_block.get('list_fmt') is not None or next_block.get('style') in ['ListBullet', 'ListParagraph'] or bool(re.match(r'^\d+[\.\)]\s+', next_block.get('raw_text', ''))))
        
        has_leading_number = bool(re.match(r'^\d+[\.\)]\s+', raw))
        has_leading_bullet = raw.startswith('•') or raw.startswith('- ')
        
        is_tool_heading = (not next_is_list) and len(raw) < 55 and not raw.endswith('.') and not raw.endswith(':') and not raw.startswith('Link Download') and (has_leading_number or ('cara' in raw.lower() or 'daftar' in raw.lower() or 'fitur' in raw.lower() or 'aplikasi' in raw.lower() or 'inavoice' in raw.lower() or 'voicemaker' in raw.lower() or 'botika' in raw.lower() or 'voiceoftext' in raw.lower() or 'wideo' in raw.lower() or 'freetts' in raw.lower() or 'sound of text' in raw.lower() or 'morphvox' in raw.lower() or 'clownfish' in raw.lower() or 'audacity' in raw.lower() or 'voicemod' in raw.lower() or 'shouter' in raw.lower() or 'announcer' in raw.lower() or 'speakwho' in raw.lower() or 'talker' in raw.lower()))
        
        is_explicit_heading = 'heading1' in style or 'heading2' in style or 'heading3' in style
        is_heading2 = False
        is_heading3 = False
        
        if is_explicit_heading:
            if 'heading1' in style or 'heading2' in style:
                is_heading2 = True
            else:
                is_heading3 = True
        elif is_tool_heading:
            is_heading3 = True
        elif (not list_fmt and not has_leading_bullet and not has_leading_number) and len(raw) < 70 and not raw.endswith('.') and not raw.endswith(':') and not raw.startswith('Link Download'):
            if ('cara' in raw.lower() or 'daftar' in raw.lower() or 'apa itu' in raw.lower() or 'fitur' in raw.lower() or 'aplikasi' in raw.lower() or 'langkah' in raw.lower() or raw.startswith('1.') or raw.startswith('2.') or raw.startswith('3.') or raw.startswith('4.') or raw.startswith('5.')):
                is_heading2 = True
            elif len(raw) < 45:
                is_heading3 = True
            
        if is_heading2 or is_heading3:
            if current_list_type:
                content_html_list.append(f'</{current_list_type}>')
                current_list_type = None
            
            clean_title = re.sub(r'^\d+\.\s*', '', raw).strip(' *:')
            anchor = re.sub(r'[^a-z0-9]+', '-', raw.lower()).strip('-')
            
            tag = 'h2' if is_heading2 else 'h3'
            if is_heading2:
                toc.append({'title': clean_title if clean_title else raw, 'anchor': anchor})
            
            content_html_list.append(f'<{tag} id="{anchor}">{html_t}</{tag}>')
            
            for h_key, img_item in img_map.items():
                if img_item['name'] not in inserted_images and (h_key in raw.lower() or raw.lower() in h_key):
                    cdn_src = to_cdn_content_url(img_item['name'])
                    content_html_list.append(f'''
<figure class="article-figure">
  <img src="{cdn_src}" alt="{html.escape(img_item['alt'])}" loading="lazy" class="article-img" />
  <figcaption>{html.escape(img_item['caption'])}</figcaption>
</figure>''')
                    inserted_images.add(img_item['name'])
                    break
                    
        elif list_fmt is not None or has_leading_number or has_leading_bullet or b['style'] in ['ListBullet', 'ListParagraph']:
            item_list_type = 'ol' if (list_fmt in ['decimal', 'lowerLetter', 'upperLetter', 'lowerRoman', 'upperRoman'] or has_leading_number or b['style'] == 'ListParagraph') else 'ul'
            
            if b['style'] == 'ListBullet' and not has_leading_number:
                item_list_type = 'ul'
            
            if current_list_type != item_list_type:
                if current_list_type:
                    content_html_list.append(f'</{current_list_type}>')
                list_class = "article-steps" if item_list_type == 'ol' else "article-list"
                content_html_list.append(f'<{item_list_type} class="{list_class}">')
                current_list_type = item_list_type
            
            clean_item = re.sub(r'^[•\-\d+\.\)\s]+', '', html_t).strip()
            if not clean_item:
                clean_item = html_t
            content_html_list.append(f'<li>{clean_item}</li>')
        else:
            if current_list_type:
                content_html_list.append(f'</{current_list_type}>')
                current_list_type = None
            
            if 'href=' in html_t and ('download' in raw.lower() or 'mediafire' in html_t or 'drive.google' in html_t):
                content_html_list.append(f'''
<div class="download-pill-box">
  <div class="download-pill-icon"><i data-lucide="download"></i></div>
  <div class="download-pill-content">
    <span class="download-label">Download Nada Dering MP3</span>
    <span class="download-action">{html_t}</span>
  </div>
</div>''')
            else:
                content_html_list.append(f'<p>{html_t}</p>')
                
    if current_list_type:
        content_html_list.append(f'</{current_list_type}>')

    for img_item in article.get('content_images', []):
        if img_item['name'] not in inserted_images:
            cdn_src = to_cdn_content_url(img_item['name'])
            content_html_list.append(f'''
<figure class="article-figure">
  <img src="{cdn_src}" alt="{html.escape(img_item['alt'])}" loading="lazy" class="article-img" />
  <figcaption>{html.escape(img_item['caption'])}</figcaption>
</figure>''')

    body_content = '\n'.join(content_html_list)
    
    if 'internal_links' in article:
        body_content = apply_internal_links(body_content, article['internal_links'])

    # Build TOC HTML
    toc_html = ''
    if len(toc) >= 3:
        toc_items = '\n'.join([f'<li><a href="#{item["anchor"]}">{html.escape(item["title"])}</a></li>' for item in toc])
        toc_html = f'''
<div class="article-toc">
  <div class="toc-header"><i data-lucide="list"></i> <span>Daftar Isi Artikel</span></div>
  <ul class="toc-list">
    {toc_items}
  </ul>
</div>'''

    # Build Related Articles
    related = [a for a in all_articles if a['slug'] != article['slug']][:3]
    related_cards_html = ''
    for r in related:
        r_cdn_cover = to_cdn_cover_url(r['cover_image'])
        related_cards_html += f'''
<a href="../{r['slug']}/" class="related-card">
  <div class="related-thumb-wrapper">
    <img src="{r_cdn_cover}" alt="{html.escape(r['title'])}" loading="lazy" class="related-thumb" />
    <span class="related-category">{r['category']}</span>
  </div>
  <div class="related-body">
    <h4 class="related-title">{html.escape(r['title'])}</h4>
    <p class="related-meta">{r['date']} • {r['read_time']}</p>
  </div>
</a>'''

    # Cover Image CDN URL (lowercase)
    cover_cdn_url = to_cdn_cover_url(article['cover_image'])
    
    html_page = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(article['title'])} — Sound of Text</title>
  <meta name="description" content="{html.escape(article['meta_desc'])}" />
  <link rel="canonical" href="https://soundtext.github.io/blog/{article['slug']}/" />
  
  <!-- Open Graph / Meta -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{html.escape(article['title'])} — Sound of Text" />
  <meta property="og:description" content="{html.escape(article['meta_desc'])}" />
  <meta property="og:image" content="{cover_cdn_url}" />
  <meta property="og:url" content="https://soundtext.github.io/blog/{article['slug']}/" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="{cover_cdn_url}" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/jpeg" href="../../icon.jpg" />
  <link rel="apple-touch-icon" href="../../icon.jpg" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    :root {{
      --colors-primary: #176B63;
      --colors-primary-bright: #1f8d83;
      --colors-primary-deep: #0f4943;
      --colors-primary-soft: #e2f3f1;
      --colors-ink: #0f1c1a;
      --colors-ink-deep: #081615;
      --colors-on-ink: #ffffff;
      --colors-canvas: #ffffff;
      --colors-cloud: #f6faf9;
      --colors-graphite: #5c726f;
      --colors-hairline: #e3ecea;
      --font-family: 'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      font-family: var(--font-family);
      color: var(--colors-ink);
      background: var(--colors-cloud);
      line-height: 1.75;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
    }}
    a {{ color: var(--colors-primary); text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    
    .topbar {{
      background: var(--colors-canvas);
      border-bottom: 1px solid var(--colors-hairline);
      position: sticky; top: 0; z-index: 100;
      padding: 14px 0;
    }}
    .container {{
      max-width: 1080px;
      margin: 0 auto;
      padding: 0 24px;
    }}
    .article-container {{
      max-width: 820px;
      margin: 0 auto;
      padding: 0 20px;
    }}
    .topbar-inner {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .topbar-brand {{
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--colors-ink);
      font-weight: 700;
      font-size: 18px;
    }}
    .topbar-brand img {{
      width: 34px; height: 34px;
      border-radius: 6px;
    }}
    .topbar-nav {{
      display: flex;
      align-items: center;
      gap: 20px;
    }}
    .topbar-link {{
      font-size: 14px;
      font-weight: 500;
      color: var(--colors-graphite);
      text-decoration: none;
    }}
    .topbar-link:hover, .topbar-link.active {{
      color: var(--colors-primary);
      text-decoration: none;
    }}
    .topbar-btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--colors-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.15s ease;
    }}
    .topbar-btn:hover {{
      background: var(--colors-primary-deep);
      text-decoration: none;
    }}

    /* Breadcrumbs */
    .breadcrumb-nav {{
      padding: 24px 0 12px;
      font-size: 13px;
      color: var(--colors-graphite);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .breadcrumb-nav a {{ color: var(--colors-graphite); text-decoration: none; }}
    .breadcrumb-nav a:hover {{ color: var(--colors-primary); }}
    .breadcrumb-sep {{ color: #a0b5b2; }}
    
    /* Article Card */
    .article-wrapper {{
      padding-bottom: 60px;
    }}
    .article-main-card {{
      background: var(--colors-canvas);
      border-radius: 8px;
      padding: 44px 44px;
      box-shadow: 0 2px 12px rgba(15, 28, 26, 0.05);
      border: 1px solid var(--colors-hairline);
    }}
    
    /* Header & Meta */
    .article-category-badge {{
      display: inline-block;
      background: var(--colors-primary-soft);
      color: var(--colors-primary);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }}
    .article-title {{
      font-size: 34px;
      font-weight: 800;
      line-height: 1.28;
      color: var(--colors-ink);
      margin-bottom: 18px;
      font-family: 'Manrope', var(--font-family);
    }}
    .article-meta-row {{
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 14px;
      color: var(--colors-graphite);
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--colors-hairline);
      flex-wrap: wrap;
    }}
    .article-meta-item {{
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .article-meta-item i {{ width: 16px; height: 16px; }}
    
    /* Hero Cover Image */
    .article-hero-img-box {{
      margin-bottom: 32px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(15, 28, 26, 0.08);
      background: var(--colors-cloud);
      text-align: center;
      border: 1px solid var(--colors-hairline);
    }}
    .article-hero-img {{
      width: 100%;
      height: auto;
      max-height: 440px;
      object-fit: cover;
      display: block;
    }}
    
    /* Table of Contents */
    .article-toc {{
      background: var(--colors-cloud);
      border: 1px solid var(--colors-hairline);
      border-left: 4px solid var(--colors-primary);
      border-radius: 6px;
      padding: 18px 22px;
      margin: 28px 0;
    }}
    .toc-header {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 15px;
      color: var(--colors-ink);
      margin-bottom: 10px;
    }}
    .toc-header i {{ width: 18px; height: 18px; color: var(--colors-primary); }}
    .toc-list {{
      list-style: none;
      padding-left: 0;
      display: grid;
      gap: 6px;
    }}
    .toc-list li {{
      font-size: 14px;
      line-height: 1.5;
    }}
    .toc-list a {{
      color: #335552;
      text-decoration: none;
    }}
    .toc-list a:hover {{
      color: var(--colors-primary);
      text-decoration: underline;
    }}
    
    /* Article Body Typography */
    .article-content h2 {{
      font-size: 23px;
      font-weight: 700;
      color: var(--colors-primary-deep);
      margin-top: 36px;
      margin-bottom: 14px;
      padding-bottom: 6px;
      border-bottom: 2px solid var(--colors-primary-soft);
      line-height: 1.35;
    }}
    .article-content h3 {{
      font-size: 18px;
      font-weight: 700;
      color: var(--colors-ink);
      margin-top: 24px;
      margin-bottom: 10px;
      line-height: 1.4;
    }}
    .article-content p {{
      margin-bottom: 18px;
      color: #2b3d3a;
      font-size: 16px;
      line-height: 1.8;
    }}
    .article-content strong {{
      color: var(--colors-ink);
      font-weight: 600;
    }}

    /* Polished List & Steps Typography */
    .article-list {{
      padding-left: 24px;
      margin: 16px 0 24px;
      list-style-type: disc;
    }}
    .article-list li {{
      margin-bottom: 10px;
      color: #2b3d3a;
      line-height: 1.75;
      padding-left: 4px;
    }}
    .article-list li::marker {{
      color: var(--colors-primary);
    }}
    
    .article-steps {{
      padding-left: 24px;
      margin: 16px 0 24px;
      list-style-type: decimal;
    }}
    .article-steps li {{
      margin-bottom: 12px;
      color: #2b3d3a;
      line-height: 1.75;
      padding-left: 6px;
    }}
    .article-steps li::marker {{
      color: var(--colors-primary);
      font-weight: 700;
    }}
    .article-steps li strong {{
      color: var(--colors-ink);
    }}

    /* Clean Contextual Internal Link */
    .contextual-internal-link {{
      color: var(--colors-primary);
      font-weight: 600;
      text-decoration: underline;
      text-decoration-thickness: 1.5px;
      text-underline-offset: 2px;
      transition: all 0.15s ease;
    }}
    .contextual-internal-link:hover {{
      color: var(--colors-primary-deep);
      background-color: var(--colors-primary-soft);
      border-radius: 2px;
      text-decoration: none;
    }}
    
    /* In-article Figures & Captions */
    .article-figure {{
      margin: 28px 0;
      text-align: center;
    }}
    .article-img {{
      max-width: 100%;
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(15, 28, 26, 0.08);
      border: 1px solid var(--colors-hairline);
      height: auto;
    }}
    .article-figure figcaption {{
      font-size: 13px;
      color: var(--colors-graphite);
      margin-top: 8px;
      font-style: italic;
    }}
    
    /* Download Table Wrap */
    .download-table-wrap {{
      overflow-x: auto;
      margin: 20px 0 28px;
      border: 1px solid var(--colors-hairline);
      border-radius: 6px;
      background: var(--colors-canvas);
      box-shadow: 0 2px 6px rgba(15, 28, 26, 0.03);
    }}
    .download-table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }}
    .download-table th {{
      background: var(--colors-cloud);
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 700;
      color: var(--colors-graphite);
      border-bottom: 1px solid var(--colors-hairline);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .download-table td {{
      padding: 10px 16px;
      border-bottom: 1px solid var(--colors-hairline);
      font-size: 14px;
      color: var(--colors-ink);
      vertical-align: middle;
    }}
    .download-table tr:last-child td {{
      border-bottom: none;
    }}
    .download-table tr:hover td {{
      background: #f1f8f7;
    }}
    .table-dl-btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--colors-primary-soft);
      color: var(--colors-primary);
      border-radius: 4px;
      font-weight: 700;
      font-size: 12px;
      text-decoration: none;
      transition: all 0.15s ease;
    }}
    .table-dl-btn:hover {{
      background: var(--colors-primary);
      color: #ffffff;
      text-decoration: none;
    }}

    /* Download Pill Box */
    .download-pill-box {{
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--colors-cloud);
      border: 1px solid var(--colors-hairline);
      border-radius: 6px;
      padding: 12px 18px;
      margin: 12px 0;
      transition: border-color 0.15s ease;
    }}
    .download-pill-box:hover {{
      border-color: var(--colors-primary-bright);
    }}
    .download-pill-icon {{
      width: 32px; height: 32px;
      border-radius: 4px;
      background: var(--colors-primary-soft);
      color: var(--colors-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }}
    .download-pill-icon i {{ width: 16px; height: 16px; }}
    .download-pill-content {{
      display: flex;
      flex-direction: column;
      gap: 2px;
    }}
    .download-label {{
      font-size: 11px;
      font-weight: 600;
      color: var(--colors-graphite);
      text-transform: uppercase;
    }}
    .download-action a {{
      font-weight: 700;
      font-size: 14px;
      color: var(--colors-primary);
    }}

    /* CTA Section */
    .article-cta-box {{
      background: linear-gradient(135deg, #0f4943 0%, #176B63 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 32px 28px;
      margin: 40px 0 20px;
      text-align: center;
    }}
    .article-cta-box h3 {{
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #ffffff;
    }}
    .article-cta-box p {{
      font-size: 15px;
      color: #d1ebe8;
      max-width: 600px;
      margin: 0 auto 20px;
      line-height: 1.6;
    }}
    .cta-buttons {{
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }}
    .btn-cta-white {{
      background: #ffffff;
      color: var(--colors-primary-deep);
      font-weight: 700;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      text-decoration: none;
      transition: background 0.15s ease;
    }}
    .btn-cta-white:hover {{
      background: #f0f7f6;
      text-decoration: none;
    }}
    .btn-cta-ghost {{
      background: rgba(255,255,255,0.15);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.3);
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      text-decoration: none;
      transition: background 0.15s ease;
    }}
    .btn-cta-ghost:hover {{
      background: rgba(255,255,255,0.25);
      text-decoration: none;
    }}

    /* Related Articles */
    .related-section {{
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid var(--colors-hairline);
    }}
    .related-title-heading {{
      font-size: 20px;
      font-weight: 700;
      color: var(--colors-ink);
      margin-bottom: 20px;
    }}
    .related-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }}
    .related-card {{
      background: var(--colors-canvas);
      border: 1px solid var(--colors-hairline);
      border-radius: 6px;
      overflow: hidden;
      text-decoration: none;
      color: var(--colors-ink);
      display: flex;
      flex-direction: column;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }}
    .related-card:hover {{
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 28, 26, 0.08);
      text-decoration: none;
    }}
    .related-thumb-wrapper {{
      position: relative;
      width: 100%;
      height: 130px;
      background: var(--colors-cloud);
      overflow: hidden;
    }}
    .related-thumb {{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }}
    .related-category {{
      position: absolute;
      top: 8px; left: 8px;
      background: rgba(15, 73, 67, 0.85);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
    }}
    .related-body {{
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: space-between;
    }}
    .related-title {{
      font-size: 13px;
      font-weight: 700;
      line-height: 1.4;
      color: var(--colors-ink);
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }}
    .related-meta {{
      font-size: 11px;
      color: var(--colors-graphite);
    }}

    /* Footer (identical to home) */
    .footer-dark {{
      background-color: var(--colors-ink-deep);
      color: #ffffff;
      padding: 60px 0 28px;
      border-top: 1px solid #1a2f2c;
      margin-top: 60px;
    }}
    .footer-top {{
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.3fr 1fr;
      gap: 36px;
      margin-bottom: 40px;
    }}
    .footer-brand {{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }}
    .footer-brand .brand-icon {{
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
    }}
    .footer-brand .brand-img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .footer-brand .brand-title {{
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }}
    .footer-motto {{
      font-size: 14px;
      color: #a7b7b5;
      max-width: 320px;
      line-height: 1.6;
    }}
    .footer-links-col h4 {{
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 14px;
    }}
    .footer-links-col {{
      display: flex;
      flex-direction: column;
      gap: 9px;
    }}
    .footer-links-col a {{
      text-decoration: none;
      color: #a7b7b5;
      font-size: 14px;
      transition: color 0.15s ease;
    }}
    .footer-links-col a:hover {{
      color: #ffffff;
    }}
    .footer-badge img {{
      height: 38px;
      width: auto;
      border-radius: 6px;
      display: block;
    }}
    .footer-bottom {{
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #1a2f2c;
      font-size: 13px;
      color: #718481;
    }}
    .footer-bottom a {{
      color: #718481;
      text-decoration: none;
      margin: 0 8px;
    }}
    .footer-bottom a:hover {{
      color: #ffffff;
    }}

    @media (max-width: 1024px) {{
      .footer-top {{ grid-template-columns: 1fr 1fr; gap: 28px; }}
      .footer-brand {{ grid-column: span 2; }}
    }}

    @media (max-width: 768px) {{
      .container {{ padding: 0 12px; }}
      .article-container {{ padding: 0 6px; }}
      .article-main-card {{ padding: 20px 12px; border-radius: 6px; }}
      .article-title {{ font-size: 24px; }}
      .related-grid {{ grid-template-columns: 1fr; }}
      .topbar-nav .topbar-link {{ display: none; }}
      .footer-top {{ grid-template-columns: 1fr; gap: 24px; }}
      .footer-brand {{ grid-column: span 1; }}
    }}
  </style>
</head>
<body>

  <!-- Top Navigation (NO JUMP LINKS) -->
  <header class="topbar">
    <div class="container">
      <div class="topbar-inner">
        <a href="../../" class="topbar-brand">
          <img src="../../icon.jpg" alt="Sound of Text" />
          <span>Sound of Text</span>
        </a>
        <nav class="topbar-nav">
          <a href="../../" class="topbar-link">Home</a>
          <a href="../" class="topbar-link active">Blog & Panduan</a>
          <a href="../../about/" class="topbar-link">About</a>
          <a href="https://play.google.com/store/apps/details?id=com.karinov.soundoftext" target="_blank" rel="noopener noreferrer" class="topbar-btn">
            <i data-lucide="download"></i> <span>Get App</span>
          </a>
        </nav>
      </div>
    </div>
  </header>

  <!-- Breadcrumb -->
  <div class="container">
    <div class="article-container">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <a href="../../">Home</a>
        <span class="breadcrumb-sep">/</span>
        <a href="../">Blog</a>
        <span class="breadcrumb-sep">/</span>
        <span>{html.escape(article['category'])}</span>
      </nav>
    </div>
  </div>

  <!-- Article Main Content -->
  <main class="article-wrapper">
    <div class="container">
      <div class="article-container">
        <article class="article-main-card">
          
          <header class="article-header">
            <span class="article-category-badge">{html.escape(article['category'])}</span>
            <h1 class="article-title">{html.escape(article['title'])}</h1>
            <div class="article-meta-row">
              <div class="article-meta-item">
                <i data-lucide="user"></i>
                <span>Sound of Text Team</span>
              </div>
              <div class="article-meta-item">
                <i data-lucide="calendar"></i>
                <span>{article['date']}</span>
              </div>
              <div class="article-meta-item">
                <i data-lucide="clock"></i>
                <span>{article['read_time']}</span>
              </div>
            </div>
          </header>

          <div class="article-hero-img-box">
            <img src="{cover_cdn_url}" alt="{html.escape(article['cover_alt'])}" class="article-hero-img" />
          </div>

          {toc_html}

          <div class="article-content">
            {body_content}
          </div>

          <!-- CTA Box -->
          <div class="article-cta-box">
            <h3>Buat Suara Teks Custom Sendiri Sekarang!</h3>
            <p>Ubah tulisan apa pun menjadi suara Google jernih secara online, atau unduh aplikasi Sound of Text Com di Google Play untuk fitur 50+ bahasa dan audio merger gratis.</p>
            <div class="cta-buttons">
              <a href="../../#demo" class="btn-cta-white">Coba Live Demo Web</a>
              <a href="https://play.google.com/store/apps/details?id=com.karinov.soundoftext" target="_blank" rel="noopener noreferrer" class="btn-cta-ghost">Download Aplikasi Android</a>
            </div>
          </div>

          <!-- Related Articles -->
          <section class="related-section">
            <h3 class="related-title-heading">Artikel Terkait Lainnya</h3>
            <div class="related-grid">
              {related_cards_html}
            </div>
          </section>

        </article>
      </div>
    </div>
  </main>

  <!-- Dark Footer (matching home) -->
  <footer class="footer-dark">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="brand-icon">
            <img src="../../icon.jpg" alt="Sound of Text" class="brand-img" />
          </div>
          <span class="brand-title">Sound of Text</span>
          <p class="footer-motto">Free text-to-speech converter and batch audio merger for creators worldwide.</p>
        </div>

        <div class="footer-links-col">
          <h4>Navigation</h4>
          <a href="../../">Home</a>
          <a href="../../#demo">Live Demo</a>
          <a href="../../#features">Capabilities</a>
          <a href="../">Blog &amp; Panduan</a>
          <a href="../../#screenshots">App Preview</a>
        </div>

        <div class="footer-links-col">
          <h4>Capabilities</h4>
          <a href="../../#features">No Voice Recording</a>
          <a href="../../#features">1-Step Translation</a>
          <a href="../../#features">Bulk Text Import</a>
          <a href="../../#features">Audio Merger</a>
        </div>

        <div class="footer-links-col">
          <h4>Community &amp; App</h4>
          <a href="https://github.com/ncpierson" target="_blank" rel="noopener noreferrer">NC Pierson on GitHub</a>
          <a href="https://soundtext.org" target="_blank" rel="noopener noreferrer">Soundtext.org Community</a>
          <a href="https://play.google.com/store/apps/details?id=com.karinov.soundoftext" target="_blank" rel="noopener noreferrer" class="footer-badge" style="margin-top: 6px;">
            <img src="../../playstore.png" alt="Google Play" />
          </a>
        </div>

        <div class="footer-links-col">
          <h4>Legal</h4>
          <a href="../../about/">About</a>
          <a href="../../privacy/">Privacy Policy</a>
          <a href="../../terms/">Terms of Service</a>
          <a href="../../disclaimer/">Disclaimer</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Sound of Text. Open web utility. All rights reserved.</p>
        <p style="margin-top: 6px; font-size: 12px;">
          <a href="../">Blog</a> · 
          <a href="../../about/">About</a> · 
          <a href="../../privacy/">Privacy</a> · 
          <a href="../../terms/">Terms</a> · 
          <a href="../../disclaimer/">Disclaimer</a>
        </p>
      </div>
    </div>
  </footer>

  <script>
    if (window.lucide) {{
      lucide.createIcons();
    }}
  </script>
</body>
</html>
'''
    return html_page

def generate_blog_index(articles):
    cards_html = ''
    for a in articles:
        cover_cdn_src = to_cdn_cover_url(a['cover_image'])
        cards_html += f'''
<article class="blog-card" data-category="{html.escape(a['category'].lower())}">
  <a href="{a['slug']}/" class="blog-card-link">
    <div class="blog-thumb-wrap">
      <img src="{cover_cdn_src}" alt="{html.escape(a['title'])}" loading="lazy" class="blog-thumb" />
      <span class="blog-category-tag">{html.escape(a['category'])}</span>
    </div>
    <div class="blog-card-body">
      <div class="blog-card-meta">
        <span>{a['date']}</span> • <span>{a['read_time']}</span>
      </div>
      <h2 class="blog-card-title">{html.escape(a['title'])}</h2>
      <p class="blog-card-desc">{html.escape(a['meta_desc'])}</p>
      <div class="blog-card-footer">
        <span class="read-more">Baca Selengkapnya <i data-lucide="arrow-right"></i></span>
      </div>
    </div>
  </a>
</article>'''

    categories = sorted(list(set([a['category'] for a in articles])))
    pills_html = '<button class="filter-pill active" data-filter="all">Semua Artikel</button>'
    for c in categories:
        pills_html += f'<button class="filter-pill" data-filter="{html.escape(c.lower())}">{html.escape(c)}</button>'

    html_index = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog & Panduan Sound of Text — Tips, Tutorial & Ringtone WA</title>
  <meta name="description" content="Kumpulan panduan, tutorial text to speech, cara membuat nada dering WhatsApp sebut nama, download sound TikTok MP3, dan ulasan tools audio terbaik." />
  <link rel="canonical" href="https://soundtext.github.io/blog/" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/jpeg" href="../icon.jpg" />
  <link rel="apple-touch-icon" href="../icon.jpg" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    :root {{
      --colors-primary: #176B63;
      --colors-primary-bright: #1f8d83;
      --colors-primary-deep: #0f4943;
      --colors-primary-soft: #e2f3f1;
      --colors-ink: #0f1c1a;
      --colors-ink-deep: #081615;
      --colors-on-ink: #ffffff;
      --colors-canvas: #ffffff;
      --colors-cloud: #f6faf9;
      --colors-graphite: #5c726f;
      --colors-hairline: #e3ecea;
      --font-family: 'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      font-family: var(--font-family);
      color: var(--colors-ink);
      background: var(--colors-cloud);
      line-height: 1.6;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
    }}
    a {{ color: var(--colors-primary); text-decoration: none; }}
    
    .topbar {{
      background: var(--colors-canvas);
      border-bottom: 1px solid var(--colors-hairline);
      position: sticky; top: 0; z-index: 100;
      padding: 14px 0;
    }}
    .container {{
      max-width: 1160px;
      margin: 0 auto;
      padding: 0 24px;
    }}
    .topbar-inner {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .topbar-brand {{
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--colors-ink);
      font-weight: 700;
      font-size: 18px;
    }}
    .topbar-brand img {{
      width: 34px; height: 34px;
      border-radius: 6px;
    }}
    .topbar-nav {{
      display: flex;
      align-items: center;
      gap: 20px;
    }}
    .topbar-link {{
      font-size: 14px;
      font-weight: 500;
      color: var(--colors-graphite);
      text-decoration: none;
    }}
    .topbar-link:hover, .topbar-link.active {{
      color: var(--colors-primary);
      text-decoration: none;
    }}
    .topbar-btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--colors-primary);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.15s ease;
    }}
    .topbar-btn:hover {{
      background: var(--colors-primary-deep);
      text-decoration: none;
    }}

    /* Hero Section (LESS ROUNDED, CLEAN GEOMETRY) */
    .blog-hero {{
      background: var(--colors-canvas);
      border-bottom: 1px solid var(--colors-hairline);
      padding: 48px 0 36px;
      text-align: center;
    }}
    .hero-badge {{
      display: inline-block;
      background: var(--colors-primary-soft);
      color: var(--colors-primary);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
    }}
    .blog-hero h1 {{
      font-size: 34px;
      font-weight: 800;
      color: var(--colors-ink);
      margin-bottom: 12px;
      font-family: 'Manrope', var(--font-family);
    }}
    .blog-hero p {{
      font-size: 16px;
      color: var(--colors-graphite);
      max-width: 660px;
      margin: 0 auto 24px;
      line-height: 1.6;
    }}

    /* Filter Pills (Clean 6px radius) */
    .filter-bar {{
      display: flex;
      justify-content: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
    }}
    .filter-pill {{
      background: var(--colors-cloud);
      border: 1px solid var(--colors-hairline);
      color: var(--colors-graphite);
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }}
    .filter-pill:hover {{
      border-color: var(--colors-primary-bright);
      color: var(--colors-primary);
    }}
    .filter-pill.active {{
      background: var(--colors-primary);
      border-color: var(--colors-primary);
      color: #ffffff;
    }}

    /* Blog Grid & Cards (Clean 8px radius) */
    .blog-grid-section {{
      padding: 40px 0 70px;
    }}
    .blog-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }}
    .blog-card {{
      background: var(--colors-canvas);
      border: 1px solid var(--colors-hairline);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(15, 28, 26, 0.04);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      display: flex;
      flex-direction: column;
    }}
    .blog-card:hover {{
      transform: translateY(-3px);
      box-shadow: 0 6px 18px rgba(15, 28, 26, 0.08);
    }}
    .blog-card-link {{
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      height: 100%;
    }}
    .blog-thumb-wrap {{
      position: relative;
      width: 100%;
      height: 190px;
      background: var(--colors-cloud);
      overflow: hidden;
    }}
    .blog-thumb {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.25s ease;
    }}
    .blog-card:hover .blog-thumb {{
      transform: scale(1.03);
    }}
    .blog-category-tag {{
      position: absolute;
      top: 10px; left: 10px;
      background: rgba(15, 73, 67, 0.9);
      backdrop-filter: blur(4px);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .blog-card-body {{
      padding: 20px 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }}
    .blog-card-meta {{
      font-size: 12px;
      color: var(--colors-graphite);
      margin-bottom: 8px;
      font-weight: 500;
    }}
    .blog-card-title {{
      font-size: 17px;
      font-weight: 700;
      line-height: 1.35;
      color: var(--colors-ink);
      margin-bottom: 8px;
      font-family: 'Manrope', var(--font-family);
    }}
    .blog-card-desc {{
      font-size: 13.5px;
      color: #4b605d;
      line-height: 1.6;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }}
    .blog-card-footer {{
      border-top: 1px solid var(--colors-hairline);
      padding-top: 12px;
    }}
    .read-more {{
      font-size: 13px;
      font-weight: 600;
      color: var(--colors-primary);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .read-more i {{ width: 14px; height: 14px; }}

    /* Footer (identical to home) */
    .footer-dark {{
      background-color: var(--colors-ink-deep);
      color: #ffffff;
      padding: 60px 0 28px;
      border-top: 1px solid #1a2f2c;
      margin-top: 60px;
    }}
    .footer-top {{
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.3fr 1fr;
      gap: 36px;
      margin-bottom: 40px;
    }}
    .footer-brand {{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }}
    .footer-brand .brand-icon {{
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
    }}
    .footer-brand .brand-img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .footer-brand .brand-title {{
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }}
    .footer-motto {{
      font-size: 14px;
      color: #a7b7b5;
      max-width: 320px;
      line-height: 1.6;
    }}
    .footer-links-col h4 {{
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 14px;
    }}
    .footer-links-col {{
      display: flex;
      flex-direction: column;
      gap: 9px;
    }}
    .footer-links-col a {{
      text-decoration: none;
      color: #a7b7b5;
      font-size: 14px;
      transition: color 0.15s ease;
    }}
    .footer-links-col a:hover {{
      color: #ffffff;
    }}
    .footer-badge img {{
      height: 38px;
      width: auto;
      border-radius: 6px;
      display: block;
    }}
    .footer-bottom {{
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #1a2f2c;
      font-size: 13px;
      color: #718481;
    }}
    .footer-bottom a {{
      color: #718481;
      text-decoration: none;
      margin: 0 8px;
    }}
    .footer-bottom a:hover {{
      color: #ffffff;
    }}

    @media (max-width: 1024px) {{
      .footer-top {{ grid-template-columns: 1fr 1fr; gap: 28px; }}
      .footer-brand {{ grid-column: span 2; }}
    }}

    @media (max-width: 960px) {{
      .blog-grid {{ grid-template-columns: repeat(2, 1fr); }}
    }}
    @media (max-width: 640px) {{
      .blog-grid {{ grid-template-columns: 1fr; }}
      .blog-hero h1 {{ font-size: 26px; }}
      .topbar-nav .topbar-link {{ display: none; }}
      .footer-top {{ grid-template-columns: 1fr; gap: 24px; }}
      .footer-brand {{ grid-column: span 1; }}
    }}
  </style>
</head>
<body>

  <!-- Top Navigation (NO JUMP LINKS) -->
  <header class="topbar">
    <div class="container">
      <div class="topbar-inner">
        <a href="../" class="topbar-brand">
          <img src="../icon.jpg" alt="Sound of Text" />
          <span>Sound of Text</span>
        </a>
        <nav class="topbar-nav">
          <a href="../" class="topbar-link">Home</a>
          <a href="./" class="topbar-link active">Blog & Panduan</a>
          <a href="../about/" class="topbar-link">About</a>
          <a href="https://play.google.com/store/apps/details?id=com.karinov.soundoftext" target="_blank" rel="noopener noreferrer" class="topbar-btn">
            <i data-lucide="download"></i> <span>Get App</span>
          </a>
        </nav>
      </div>
    </div>
  </header>

  <!-- Hero Banner (Less rounded, clean geometric) -->
  <section class="blog-hero">
    <div class="container">
      <span class="hero-badge">ARTIKEL &amp; PANDUAN</span>
      <h1>Tips, Tutorial &amp; Suara Google Sound of Text</h1>
      <p>Panduan lengkap seputar text-to-speech, download nada dering WhatsApp viral, sound TikTok, dan rekomendasi aplikasi audio terbaik.</p>
      
      <div class="filter-bar" id="filterBar">
        {pills_html}
      </div>
    </div>
  </section>

  <!-- Blog Listing -->
  <section class="blog-grid-section">
    <div class="container">
      <div class="blog-grid" id="blogGrid">
        {cards_html}
      </div>
    </div>
  </section>

  <!-- Dark Footer (matching home) -->
  <footer class="footer-dark">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="brand-icon">
            <img src="../icon.jpg" alt="Sound of Text" class="brand-img" />
          </div>
          <span class="brand-title">Sound of Text</span>
          <p class="footer-motto">Free text-to-speech converter and batch audio merger for creators worldwide.</p>
        </div>

        <div class="footer-links-col">
          <h4>Navigation</h4>
          <a href="../">Home</a>
          <a href="../#demo">Live Demo</a>
          <a href="../#features">Capabilities</a>
          <a href="./">Blog &amp; Panduan</a>
          <a href="../#screenshots">App Preview</a>
        </div>

        <div class="footer-links-col">
          <h4>Capabilities</h4>
          <a href="../#features">No Voice Recording</a>
          <a href="../#features">1-Step Translation</a>
          <a href="../#features">Bulk Text Import</a>
          <a href="../#features">Audio Merger</a>
        </div>

        <div class="footer-links-col">
          <h4>Community &amp; App</h4>
          <a href="https://github.com/ncpierson" target="_blank" rel="noopener noreferrer">NC Pierson on GitHub</a>
          <a href="https://soundtext.org" target="_blank" rel="noopener noreferrer">Soundtext.org Community</a>
          <a href="https://play.google.com/store/apps/details?id=com.karinov.soundoftext" target="_blank" rel="noopener noreferrer" class="footer-badge" style="margin-top: 6px;">
            <img src="../playstore.png" alt="Google Play" />
          </a>
        </div>

        <div class="footer-links-col">
          <h4>Legal</h4>
          <a href="../about/">About</a>
          <a href="../privacy/">Privacy Policy</a>
          <a href="../terms/">Terms of Service</a>
          <a href="../disclaimer/">Disclaimer</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Sound of Text. Open web utility. All rights reserved.</p>
        <p style="margin-top: 6px; font-size: 12px;">
          <a href="./">Blog</a> · 
          <a href="../about/">About</a> · 
          <a href="../privacy/">Privacy</a> · 
          <a href="../terms/">Terms</a> · 
          <a href="../disclaimer/">Disclaimer</a>
        </p>
      </div>
    </div>
  </footer>

  <script>
    if (window.lucide) {{
      lucide.createIcons();
    }}

    // Filter interaction
    const pills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.blog-card');

    pills.forEach(pill => {{
      pill.addEventListener('click', () => {{
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');

        cards.forEach(card => {{
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {{
            card.style.display = 'flex';
          }} else {{
            card.style.display = 'none';
          }}
        }});
      }});
    }});
  </script>
</body>
</html>
'''
    return html_index

def main():
    articles_dir = r'soundtext-articles/articles'
    blog_dir = r'blog'
    os.makedirs(blog_dir, exist_ok=True)

    for item in ARTICLES_DATA:
        docx_path = os.path.join(articles_dir, item['file'])
        if not os.path.exists(docx_path):
            print(f"Warning: {docx_path} not found!")
            continue
        
        blocks = parse_docx(docx_path)
        article_html = generate_article_html(item, blocks, ARTICLES_DATA)
        
        item_dir = os.path.join(blog_dir, item['slug'])
        os.makedirs(item_dir, exist_ok=True)
        
        target_file = os.path.join(item_dir, 'index.html')
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(article_html)
        print(f"Generated: {target_file}")

    # Generate Blog Index
    index_html = generate_blog_index(ARTICLES_DATA)
    index_target = os.path.join(blog_dir, 'index.html')
    with open(index_target, 'w', encoding='utf-8') as f:
        f.write(index_html)
    print(f"Generated Blog Archive: {index_target}")

if __name__ == '__main__':
    main()
