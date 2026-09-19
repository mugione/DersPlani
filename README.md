<div align="center">

# ◈ Ders Dağılım Sistemi

**Okul ders programını derslik, öğretmen ve şube kısıtlarına göre otomatik oluşturan açık kaynaklı web uygulaması.**

[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-3ddc97.svg)](LICENSE)
[![Bağımlılık](https://img.shields.io/badge/Ba%C4%9F%C4%B1ml%C4%B1l%C4%B1k-0-6c8cff.svg)](#mimari)
[![Kurulum](https://img.shields.io/badge/Build%20ad%C4%B1m%C4%B1-Yok-6c8cff.svg)](#yayınlama)
[![PR'lara açık](https://img.shields.io/badge/PR'lara-a%C3%A7%C4%B1k-ffb84d.svg)](#katkı)

Vanilla JavaScript · Sıfır bağımlılık · Veriler tarayıcıda kalır

</div>

---

## 📖 İçindekiler

- [Neden?](#neden)
- [Özellikler](#özellikler)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Kullanım](#kullanım)
- [Yerleştirme Kuralları](#yerleştirme-kuralları)
- [Mimari](#mimari)
- [Yayınlama](#yayınlama)
- [Veri & Gizlilik](#veri--gizlilik)
- [Yol Haritası](#yol-haritası)
- [Katkı](#katkı)
- [Lisans](#lisans)

---

## 💡 Neden?

Ders programı hazırlamak elle yapıldığında saatler süren, hataya son derece açık bir iştir: bir öğretmenin
aynı saatte iki sınıfta görünmesi ya da 30 kişilik bir şubenin 20 kişilik dersliğe atanması kolayca gözden kaçar.
Bu uygulama kısıtları tanımlamanızı ister, gerisini geri izlemeli (backtracking) bir arama ile kendisi çözer —
ve çözemediği yeri sessizce geçmek yerine **hangi dersin kaç saatinin neden yerleşmediğini** açıkça raporlar.

## ✨ Özellikler

| | Özellik | Açıklama |
|:--:|---|---|
| 🏫 | **Derslik yönetimi** | Derslik no, kapasite ve tür (normal / laboratuvar / atölye / spor salonu) |
| 👩‍🏫 | **Öğretmen kısıtları** | Branş, haftalık ve günlük maksimum saat, ızgaradan tıklanan müsait olmayan saatler, serbest not |
| 🎓 | **Şube & ders yükü** | Öğrenci sayısı, ders başına haftalık saat, gerekli derslik türü, blok ders tercihi |
| 🧮 | **Otomatik yerleştirme** | En kısıtlı dersten başlayan geri izlemeli arama; çakışmasız sonuç |
| 📊 | **Üç görünüm** | Programı sınıf, öğretmen veya derslik perspektifinden inceleyin |
| ⚠️ | **Şeffaf raporlama** | Çözüm bulunamazsa en dolu kısmi program + eksiklerin satır satır gerekçesi |
| 🖨️ | **Yazdırma** | Arayüz öğeleri gizlenerek temiz çıktı |
| 💾 | **JSON yedekleme** | Tüm veriyi tek dosyaya aktarın, başka cihazda geri yükleyin |
| 🌗 | **Koyu / açık tema** | Tercih tarayıcıda hatırlanır |
| 📱 | **Duyarlı tasarım** | Masaüstü ve tablet uyumlu |

## 🚀 Hızlı Başlangıç

```bash
git clone https://github.com/<kullanıcı-adınız>/ders-plani.git
cd ders-plani
python3 -m http.server 8080
```

Tarayıcıda `http://localhost:8080` adresini açın. Derleme, `npm install`, sunucu tarafı — hiçbiri gerekmez;
dosyaları doğrudan çift tıklayarak da açabilirsiniz.

## 📋 Kullanım

Sekmeleri soldan sağa sırayla doldurmak en hızlı yoldur:

**1. Ayarlar** — Gün listesi (virgülle ayrılmış) ve günlük ders saati sayısı. Diğer sekmelerdeki ızgaralar bu ayara göre şekillenir.

**2. Derslikler** — Derslik no/ad, kapasite ve tür. Kapasite, hangi şubenin o dersliğe girebileceğini belirler.

**3. Öğretmenler** — Ad, branş, haftalık ve günlük maksimum ders saati. Müsait olmadığı saatleri ızgaradan tıklayarak işaretleyin (kırmızı = kapalı). "Salı günü gelmiyor", "raporlu" gibi durumlar için serbest not alanı vardır.

**4. Sınıflar** — Önce şubeyi (ad + öğrenci sayısı) ekleyin, ardından o şubeye ders yüklerini tanımlayın: ders adı, öğretmen, haftalık saat, gerekli derslik türü ve isteğe bağlı blok tercihi.

**5. Program** — **Programı Oluştur**'a basın. Sonucu sınıf / öğretmen / derslik görünümleri arasında geçiş yaparak inceleyin, dilerseniz yazdırın.

> [!TIP]
> Bir sınıfın toplam ders saati haftalık slot sayısını aşarsa ya da bir öğretmenin yükü limitini geçerse,
> ilgili sekmede **uyarı işareti** belirir — programı oluşturmadan önce fark edersiniz.

## ⚙️ Yerleştirme Kuralları

Algoritmanın uyduğu kısıtlar:

- **Çakışma yok** — Öğretmen, derslik ve şube aynı saatte iki yerde bulunamaz.
- **Kapasite** — Derslik kapasitesi ≥ şubenin öğrenci sayısı olmalıdır.
- **Derslik türü** — Bir ders belirli bir tür istiyorsa (örn. laboratuvar) yalnızca o tür kullanılır.
- **Öğretmen müsaitliği** — Kapalı işaretlenen saatlere ders konmaz; günlük ve haftalık limitler korunur.
- **Ders dağılımı** — Aynı ders bir şubeye günde en fazla 2 saat konur.
- **Blok dersler** — "Blok" işaretli dersler mümkün olduğunca ardışık iki saat yerleştirilir.
- **Denge** — Günler şubenin en boş gününden doldurulur, böylece yük haftaya dengeli dağılır.
- **Kısmi çözüm** — Tam çözüm yoksa arama boyunca ulaşılan **en dolu** yerleşim gösterilir; hiçbir zaman boş program dönmez.

Yerleştirme mantığı [`app.js`](app.js) içindeki `generate()` fonksiyonundadır.

## 🧱 Mimari

```
ders-plani/
├── index.html    Sekmeli arayüz iskeleti
├── styles.css    Tema değişkenleri, bileşen stilleri, yazdırma kuralları
├── app.js        Durum yönetimi, CRUD, yerleştirme algoritması, görünümler
├── _headers      Cloudflare Pages güvenlik başlıkları
├── LICENSE       MIT
└── README.md
```

Üç dosyalık, çerçevesiz (framework'süz) bir yapı. Tüm uygulama durumu tek bir `S` nesnesinde tutulur ve
her değişiklikte `localStorage`'a yazılır. Derleme aracı, paket yöneticisi veya çalışma zamanı bağımlılığı yoktur —
bu sayede on yıl sonra da aynı şekilde açılır.

## 🌐 Yayınlama

Build adımı olmadığı için dizini olduğu gibi yükleyebilirsiniz.

**Cloudflare Pages (CLI):**

```bash
npx wrangler pages deploy . --project-name ders-plani
```

**Cloudflare Pages (panel):** Build command alanını **boş** bırakın, Build output directory alanına `/` yazın.

Aynı dosyalar GitHub Pages, Netlify, Vercel veya herhangi bir statik sunucuda da değişiklik gerektirmeden çalışır.

## 🔒 Veri & Gizlilik

Uygulama hiçbir veriyi dışarı göndermez; sunucu tarafı, hesap sistemi ve analitik yoktur.
Girdiğiniz her şey yalnızca kendi tarayıcınızın `localStorage`'ında durur.

> [!IMPORTANT]
> Veriler tarayıcıya ve cihaza özeldir. Tarayıcı verilerini temizlemek programı da siler.
> Düzenli olarak **Dışa Aktar** ile JSON yedeği alın; başka bir cihazda **İçe Aktar** ile geri yükleyin.

## 🗺️ Yol Haritası

Katkıya açık fikirler:

- [ ] Sürükle-bırak ile program üzerinde elle düzenleme
- [ ] Excel / CSV dışa aktarma
- [ ] Birden fazla program taslağını karşılaştırma
- [ ] Öğretmenlerin boş saatlerini (pencere) en aza indiren optimizasyon
- [ ] Çok şubeli derslerde ortak (birleşik) ders desteği
- [ ] İsteğe bağlı bulut senkronizasyonu

## 🤝 Katkı

Bu proje açık kaynaktır ve katkılara açıktır. Hata bildirimi, fikir önerisi ve pull request'ler memnuniyetle karşılanır.

1. Depoyu fork edin ve bir dal oluşturun: `git checkout -b ozellik/harika-fikir`
2. Değişikliğinizi yapın. Kod stili basittir: vanilla JS, bağımlılık eklemeden, mevcut adlandırma düzenine uyarak.
3. Değişikliği tarayıcıda deneyin — özellikle yerleştirme mantığına dokunduysanız birkaç farklı şube/derslik senaryosu kurun.
4. Commit'leyip PR açın: `git commit -m "Şunu ekler"`

Büyük bir değişiklik planlıyorsanız, önce bir issue açarak konuşalım.

## 📄 Lisans

Bu proje **MIT Lisansı** ile açık kaynak olarak yayımlanmıştır — kullanım, değiştirme, dağıtım ve ticari
kullanım serbesttir; tek koşul telif bildiriminin korunmasıdır. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.

<div align="center">
<sub>Öğretmenlerin ders programı yerine derse vakit ayırabilmesi için yapıldı.</sub>
</div>
