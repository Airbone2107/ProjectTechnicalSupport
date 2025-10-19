# Hệ thống Hỗ trợ Kỹ thuật (Technical Support System)

Đây là một dự án full-stack bao gồm một backend API xây dựng bằng ASP.NET Core và một frontend xây dựng bằng React (Vite). Mục tiêu của dự án là cung cấp một hệ thống quản lý các yêu cầu hỗ trợ (ticket) cho một tổ chức.

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu Hệ thống](#yêu-cầu-hệ-thống)
- [Hướng dẫn Cài đặt](#hướng-dẫn-cài-đặt)
  - [1. Tải Project về](#1-tải-project-về)
  - [2. Cấu hình Backend (.NET API)](#2-cấu-hinh-backend-net-api)
  - [3. Cấu hình Frontend (React App)](#3-cấu-hinh-frontend-react-app)
- [Chạy Toàn bộ Ứng dụng](#chạy-toàn-bộ-ứng-dụng)
- [Tài khoản Mặc định](#tài-khoản-mặc-định)
- [Xử lý sự cố thường gặp](#xử-lý-sự-cố-thường-gặp)

## Tính năng chính

- **Quản lý Ticket:** Tạo, xem, cập nhật, xóa, gán ticket.
- **Phân quyền & Vai trò:** Hệ thống phân quyền chi tiết cho Client, Agent, Manager, Admin.
- **Quản lý Người dùng & Nhóm:** Quản lý tài khoản người dùng, thêm/xóa thành viên trong các nhóm hỗ trợ.
- **Bình luận & Đính kèm file:** Trao đổi thông tin trong ticket và đính kèm các tệp tin liên quan.
- **Real-time Notification:** Cập nhật trạng thái và thông báo tức thì bằng SignalR.
- **Tự động gán Ticket:** Gán ticket vào nhóm mặc định dựa trên loại vấn đề.

## Công nghệ sử dụng

- **Backend:**
  - .NET 9, ASP.NET Core Web API
  - Entity Framework Core 9
  - SQL Server
  - ASP.NET Core Identity (Quản lý người dùng)
  - JWT (Xác thực)
  - AutoMapper, FluentValidation
  - SignalR (Real-time)
- **Frontend:**
  - React 19 (Vite)
  - TypeScript
  - Material-UI (MUI)
  - TanStack Query (React Query)
  - Zustand (State Management)
  - Axios
  - Notistack (Notifications)

## Yêu cầu Hệ thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau:

- **Git:** Để clone repository.
- **.NET 9 SDK** hoặc mới hơn.
- **Visual Studio 2022:** Với workload "ASP.NET and web development".
- **SQL Server:** Phiên bản Developer hoặc Express được khuyến khích cho môi trường local.
- **Node.js:** Phiên bản 18.x hoặc mới hơn.
- **NPM** (thường đi kèm với Node.js).
- Một trình soạn thảo code cho frontend như **Visual Studio Code**, **Cursor**, hoặc tương tự.

## Hướng dẫn Cài đặt

### 1. Tải Project về

Mở terminal (CMD, PowerShell, Git Bash) và chạy lệnh sau để clone repository về máy:

```bash
git clone <URL_CUA_REPOSITORY>
cd <TEN_THU_MUC_PROJECT>
```

### 2. Cấu hình Backend (.NET API)

Các bước sau được thực hiện trong **Visual Studio 2022**.

#### a. Mở Project

- Mở file `TechnicalSupportBackend/TechnicalSupport.sln` bằng Visual Studio.

#### b. Cấu hình Chuỗi kết nối (Connection String)

Backend cần kết nối đến một database SQL Server. Bạn cần cập nhật chuỗi kết nối cho môi trường phát triển của mình.

1.  Trong **Solution Explorer**, tìm đến project `TechnicalSupport.Api`.
2.  Mở file `appsettings.json`. Bạn sẽ thấy một chuỗi kết nối mẫu:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=DESKTOP-RPQCVR7\\AIRBONE;Database=TechnicalSupportDB;Trusted_Connection=True;TrustServerCertificate=True;"
    }
    ```
3.  **Không sửa file này.** Thay vào đó, bạn hãy tạo một file mới tên là `appsettings.Development.json` trong cùng thư mục `TechnicalSupport.Api` (nếu chưa có). File này sẽ ghi đè lên cấu hình trong `appsettings.json` khi chạy ở môi trường Development.
4.  Copy và dán nội dung sau vào `appsettings.Development.json`, **thay đổi giá trị `Server`** thành tên SQL Server instance trên máy của bạn.
    - Để tìm tên server, bạn có thể mở SQL Server Management Studio (SSMS) và copy tên server từ màn hình đăng nhập.
    - Nếu bạn dùng SQL Server Express, tên server thường là `.\\SQLEXPRESS` hoặc `(localdb)\\mssqllocaldb`.

    ```json
    // TechnicalSupportBackend/TechnicalSupport.Api/appsettings.Development.json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=TEN_MAY_CHU_SQL_CUA_BAN;Database=TechnicalSupportDB;Trusted_Connection=True;TrustServerCertificate=True;"
      }
    }
    ```

#### c. Cập nhật Database

Project sử dụng Entity Framework Core Migrations để quản lý schema của database.

1.  Trong Visual Studio, đi đến `Tools` -> `NuGet Package Manager` -> `Package Manager Console`.
2.  Đảm bảo rằng trong `Package Manager Console`, mục `Default project` được chọn là `TechnicalSupport.Infrastructure`.
3.  Chạy lệnh sau để tạo và cập nhật database dựa trên các migration đã có:

    ```powershell
    Update-Database
    ```

    Lệnh này sẽ tạo database `TechnicalSupportDB` trên SQL Server của bạn và áp dụng tất cả các bảng cần thiết.

#### d. Chạy Backend

1.  Trong **Solution Explorer**, chuột phải vào project `TechnicalSupport.Api` và chọn `Set as Startup Project`.
2.  Nhấn phím `F5` hoặc nút `Start` (mũi tên màu xanh) trên thanh công cụ của Visual Studio.
3.  Một cửa sổ trình duyệt sẽ mở ra với giao diện Swagger UI tại một địa chỉ URL, thường là `https://localhost:7194`. **Hãy ghi nhớ URL này**, bạn sẽ cần nó cho frontend.
4.  Backend đã sẵn sàng! Dữ liệu mẫu (người dùng, tickets) sẽ được tự động tạo lần đầu tiên.

### 3. Cấu hình Frontend (React App)

Các bước sau được thực hiện trong **Visual Studio Code**, **CMD**, hoặc một terminal bất kỳ.

#### a. Mở thư mục Frontend

Mở một cửa sổ terminal mới và điều hướng đến thư mục của frontend:

```bash
cd TechnicalSupportFrontend
```

#### b. Cài đặt các gói phụ thuộc

Chạy lệnh sau để cài đặt tất cả các thư viện cần thiết từ file `package.json`:

```bash
npm install
```

#### c. Cấu hình Biến môi trường (.env)

Mặc dù trong project này URL của API đang được đặt cứng, cách làm tốt nhất là sử dụng file `.env`. Bạn có thể tạo một file tên là `.env` trong thư mục gốc `TechnicalSupportFrontend` và thêm vào đó URL của backend.

**Lưu ý:** Trong project hiện tại, file `src/lib/axiosClient.ts` đang hardcode `baseURL: 'https://localhost:7194'`. Hãy đảm bảo URL này khớp với URL mà backend của bạn đang chạy. Nếu backend chạy ở một port khác, bạn cần sửa lại file này.

#### d. Chạy Frontend

Chạy lệnh sau để khởi động server phát triển của Vite:

```bash
npm run dev
```

Terminal sẽ hiển thị một URL, thường là `http://localhost:7194`. Mở URL này trong trình duyệt của bạn.

## Chạy Toàn bộ Ứng dụng

Để ứng dụng hoạt động đầy đủ, bạn cần:

1.  **Chạy Backend:** Từ Visual Studio (như bước 2d).
2.  **Chạy Frontend:** Từ terminal (như bước 3d).

Bây giờ bạn có thể truy cập `http://localhost:7194` và sử dụng ứng dụng.

## Tài khoản Mặc định

Dự án có sẵn một số tài khoản mẫu để bạn đăng nhập và trải nghiệm các vai trò khác nhau. Mật khẩu cho tất cả các tài khoản dưới đây là: `Password123!`

| Email                      | Vai trò chính      | Ghi chú                                   |
| -------------------------- | ------------------ | ----------------------------------------- |
| `admin@example.com`        | **Admin**          | Có tất cả quyền hạn trong hệ thống.        |
| `usermanager@example.com`  | **Manager**        | Quản lý người dùng, không quản lý ticket.   |
| `ticketmanager@example.com`| **Ticket Manager** | Quản lý tất cả ticket, phân loại ticket.  |
| `group.manager1@example.com`| **Group Manager**  | Quản lý thành viên và ticket trong nhóm.    |
| `client@example.com`       | **Client**         | Người dùng cuối, tạo và xem ticket của mình. |
| `agent1@example.com`       | **Agent**          | Nhân viên hỗ trợ, xử lý ticket được giao.   |

## Xử lý sự cố thường gặp

- **Lỗi CORS:**
  - **Nguyên nhân:** Backend không chạy, hoặc frontend đang gọi đến sai địa chỉ/port của backend.
  - **Giải pháp:**
    1.  Đảm bảo backend đang chạy và bạn có thể truy cập Swagger UI.
    2.  Kiểm tra `baseURL` trong file `TechnicalSupportFrontend/src/lib/axiosClient.ts` và đảm bảo nó khớp với URL của backend.
    3.  Kiểm tra CORS policy trong `TechnicalSupportBackend/TechnicalSupport.Api/Program.cs` có cho phép `http://localhost:7194` không.

- **Lỗi kết nối Database:**
  - **Nguyên nhân:** Chuỗi kết nối trong `appsettings.Development.json` sai.
  - **Giải pháp:**
    1.  Kiểm tra lại tên `Server` trong chuỗi kết nối.
    2.  Đảm bảo dịch vụ SQL Server trên máy bạn đang chạy.
    3.  Thử chạy lại lệnh `Update-Database` trong Package Manager Console.

- **Frontend báo lỗi khi đăng nhập/tải dữ liệu:**
  - **Nguyên nhân:** Backend API chưa được khởi động.
  - **Giải pháp:** Hãy chắc chắn rằng bạn đã khởi chạy backend từ Visual Studio trước khi sử dụng frontend.
```