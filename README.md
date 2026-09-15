# R1 GDD Wiki — trang tổng hợp

Trang tĩnh gom 5 bộ wiki GDD lại một chỗ: menu trái chọn game, nội dung game hiện bên phải.

**Nội dung từng game không được sao chép vào đây.** Mỗi game được nhúng thẳng bằng `<iframe>`
từ GitHub Pages của nó, nên wiki con cập nhật là ở đây thấy ngay — không có bản sao nào bị cũ.
Số liệu trên các thẻ ở trang tổng quan cũng được `fetch()` trực tiếp từ trang chủ của từng wiki
mỗi lần mở.

## Các wiki con

| Game | Địa chỉ |
|---|---|
| Royal Match | https://haodhh-r1abi.github.io/RoyalMatchWiki/ |
| Magic Sort | https://haodhh-r1abi.github.io/MagicSortWiki/ |
| Block Out! | https://haodhh-r1abi.github.io/BlockOutWiki/ |
| Match Factory | https://haodhh-r1abi.github.io/MatchFactoryWiki/ |
| Fish Sort Puzzle | https://haodhh-r1abi.github.io/FishSortPuzzleWiki/ |

## Dùng

Mở `index.html` **qua một web server**, không mở bằng `file://` — vì trang cần đọc
`assets/games.json` và gọi `fetch()` lấy số liệu, hai việc này bị chặn ở giao thức `file://`.

```bash
cd D:\APKProtect\R1GDDWiki
python -m http.server 8742
```

Rồi vào `http://127.0.0.1:8742/`.

Khi đưa lên GitHub Pages thì mở thẳng địa chỉ trang là chạy (`.nojekyll` đã có sẵn).

## Bố cục

Không có thanh ngang phía trên — mọi thứ nằm gọn trong menu trái, để nội dung wiki con
**chiếm trọn chiều cao màn hình**. Menu trái gồm ba phần:

- **Đầu menu**: nút **☰** thu gọn + tên trang (bấm vào là về trang tổng quan)
- **Giữa**: danh sách 5 game (phần duy nhất cuộn được)
- **Chân menu**: ba nút icon — **⌂** về trang tổng quan (luôn có), **⟳** tải lại và **↗** mở
  tab riêng (chỉ hiện khi đang xem một game)

## Thao tác

| | |
|---|---|
| Thu gọn / mở menu | nút **☰** ở đầu menu, hoặc **Ctrl+B** |
| Về trang tổng quan | nút **⌂** ở chân menu, hoặc tên trang ở đầu menu |
| Tải lại trang đang xem | nút **⟳** |
| Mở wiki con ra tab riêng | nút **↗** |

Thu gọn **không làm menu biến mất** mà rút lại thành một dải icon hẹp (56px): vẫn còn nút ☰,
icon 5 game (rê chuột có tên), và ba nút ở chân. Làm vậy vì nút thu gọn nằm trong chính
menu — nếu thu về 0 thì không còn chỗ nào bấm để mở lại.

Trạng thái thu gọn được nhớ cho lần sau (localStorage). Lần đầu vào bằng màn hình hẹp
(< 820px) thì menu tự thu; chọn một game trên màn hình hẹp cũng tự thu.

> **Ctrl+B chỉ ăn khi con trỏ đang ở phần menu.** Lúc bạn đang đọc bên trong wiki con, phím
> bấm thuộc về iframe khác tên miền nên trang ngoài không nhận được — dùng nút ☰ thay thế.

## Địa chỉ chia sẻ được

Mỗi game có một địa chỉ riêng, bấm F5 hay gửi cho người khác đều vào đúng chỗ:

```
#/blockout
#/matchfactory
#/blockout/features/Ads.html      ← mở thẳng một trang bên trong wiki con
```

Dạng thứ ba chỉ tự sinh ra được khi trang tổng hợp và wiki con **cùng tên miền**
(tức khi đã deploy lên `haodhh-r1abi.github.io`). Lúc đó điều hướng sâu trong iframe sẽ tự
phản ánh lên thanh địa chỉ. Chạy ở localhost thì khác tên miền nên trình duyệt chặn việc đọc
đường dẫn bên trong iframe — mất tính năng này, mọi thứ còn lại vẫn chạy bình thường.

## Thêm hoặc sửa game

Sửa `assets/games.json`, không phải đụng vào HTML/JS:

```json
{
 "id": "tengame",
 "name": "Tên hiển thị",
 "url": "https://haodhh-r1abi.github.io/TenGameWiki/",
 "icon": "assets/img/tengame.png",
 "studio": "Studio",
 "genre": "Thể loại",
 "note": "Một câu mô tả trên thẻ."
}
```

Icon lấy từ `GameDesign/site/assets/img/crown.png` của game đó rồi đổi tên thành `<id>.png`.

## Cấu trúc

```
R1GDDWiki/
├─ index.html            khung trang
├─ assets/
│  ├─ style.css
│  ├─ app.js             định tuyến, thu gọn menu, lấy số liệu trực tiếp
│  ├─ games.json         danh sách game — chỗ duy nhất cần sửa khi thêm game
│  └─ img/               icon 5 game
├─ .nojekyll
└─ README.md
```

## Ghi chú kỹ thuật

- 5 wiki con đều trả `Access-Control-Allow-Origin: *` và **không** đặt `X-Frame-Options`
  hay `frame-ancestors`, nên vừa nhúng iframe vừa `fetch()` đều được.
- Nếu một wiki con không mở lên trong 12 giây, trang sẽ hiện thông báo kèm nút mở tab mới
  thay vì để khung trắng.
- Đường dẫn trong hash được lọc, không cho nhét URL tuyệt đối vào iframe.
