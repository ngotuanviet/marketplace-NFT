Dựa CHÍNH XÁC vào đoạn code bạn đang làm (dự án Web tạo NFT Marketplace kết nối MetaMask, IPFS Pinata và Smart Contract), bạn hãy chọn một trong các tên đề tài dưới đây để báo cáo giảng viên. Chúng nằm trong nhóm "Phân tích thiết kế website ứng dụng công nghệ Blockchain":

LỰA CHỌN 1 (Đầy đủ nhất):
"Phân tích thiết kế và xây dựng Website Sàn giao dịch Tài sản số (NFT Marketplace) ứng dụng công nghệ Blockchain Ethereum."

LỰA CHỌN 2 (Ngắn gọn, chuyên nghiệp):
"Nghiên cứu công nghệ Web3 và Phát triển Ứng dụng Phi tập trung (dApp): Sàn giao dịch NFT."

LỰA CHỌN 3 (Nhấn mạnh công nghệ bên trong code):
"Ứng dụng Hợp đồng thông minh (Smart Contract) và IPFS trong việc Phân tích thiết kế Website Giao dịch NFT."

CHỨNG MINH ĐỀ TÀI QUA ĐOẠN CODE CỦA BẠN:
Khi báo cáo, bạn hãy chỉ ra các điểm này trong file page.tsx để giảng viên thấy bạn đã áp dụng chuẩn thuật toán Blockchain:

1. Tính Phân Tán (Decentralized Storage)
- Sinh viên không dùng Database truyền thống (SQL) mà gọi hàm uploadToIPFS() để nén dữ liệu thành chuẩn JSON và đưa lên mạng lưới lưu trữ IPFS qua dịch vụ Pinata.
- Mã Hash nhận về (tokenURI) là duy nhất và không thể sửa đổi (Tính bất biến của Blockchain).

2. Xóa bỏ máy chủ Trung Tâm (Web3 Authentication)
- Website không có hàm Đăng nhập (Login). Sinh viên gọi hàm new Web3Modal().connect() để người dùng trực tiếp dùng Ví Tiền Mã Hóa (MetaMask) kết nối thẳng vào Web thông qua Ethers.js. Tài khoản ngân hàng số chính là danh tính người dùng.

3. Hợp đồng thông minh (Smart Contract Interaction)
- Trong hàm listNFTForSale(), sinh viên kết nối trực tiếp với Sổ Cái Blockchain (Mạng Sepolia/Goerli) bằng hàm provider.getSigner() (Dùng mật mã học chữ ký số).
- Cuối cùng, hàm contract.createToken(url, price) là lúc sinh viên gửi Yêu cầu Giao dịch (Transaction) tạo một Khối Mới trên Blockchain chứa bản ghi quyền sở hữu NFT này.
