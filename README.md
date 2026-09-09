# VitaFlix

Ứng dụng xem phim trực tuyến được xây dựng với React và Vite.

## Công nghệ

- React 18
- Vite
- React Router
- Bootstrap
- Axios
- HLS.js và Plyr

## Cài đặt

Yêu cầu Node.js 18 trở lên.

```bash
npm install
```

## Chạy môi trường phát triển

```bash
npm run dev
```

Ứng dụng chạy mặc định tại `http://localhost:3000`.

## Build production

```bash
npm run build
npm run preview
```

## Cấu trúc chính

```text
src/
	components/   Thành phần giao diện React
	pages/        Các trang và route
	services/     Gọi API và lưu trữ dữ liệu
	styles/       CSS toàn cục và component
	main.jsx      Entrypoint của ứng dụng
public/         Hình ảnh và tài nguyên tĩnh
api/            Vercel serverless proxy
```

## Deploy Vercel

Project dùng cấu hình trong `vercel.json`. Khi repository GitHub được liên kết với Vercel, mỗi lần push lên branch `main` sẽ tạo deployment mới.

Build command: `npm run build`

Output directory: `dist`
