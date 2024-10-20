import socket
import time
import threading
import argparse

# 定义发送 UDP 包的函数
def udp_test(server_ip, server_port, message, duration=10):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    start_time = time.time()
    
    try:
        while time.time() - start_time < duration:
            sock.sendto(message.encode(), (server_ip, server_port))
    except Exception as e:
        print(f"UDP error occurred: {e}")
    finally:
        sock.close()

# 定义发送 TCP 包的函数
def tcp_test(server_ip, server_port, message, duration=10):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((server_ip, server_port))
        start_time = time.time()

        while time.time() - start_time < duration:
            sock.sendall(message.encode())
            try:
                # 接收服务器的响应
                response = sock.recv(1024)
                print(f"Received from server: {response.decode()}")
            except socket.error as e:
                print(f"TCP receiving error: {e}")
    except Exception as e:
        print(f"TCP error occurred: {e}")
    finally:
        sock.close()

# 运行 UDP 测试的函数
def run_udp_test(server_ip, server_port, duration=10, thread_count=50000):
    message = "GT" * 1500  # 创建 1500 字节的数据包
    threads = []

    for _ in range(thread_count):
        thread = threading.Thread(target=udp_test, args=(server_ip, server_port, message, duration))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

# 运行 TCP 测试的函数
def run_tcp_test(server_ip, server_port, duration=10, thread_count=50000):
    message = "GT" * 1500  # 创建 1500 字节的数据包
    threads = []

    for _ in range(thread_count):
        thread = threading.Thread(target=tcp_test, args=(server_ip, server_port, message, duration))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

if __name__ == "__main__":
    # 使用 argparse 来解析命令行参数
    parser = argparse.ArgumentParser(description="L4 Traffic Test for TCP and UDP")
    parser.add_argument("address", type=str, help="目标 IP 和端口，格式为 ip:port，例如 127.0.0.1:12345")
    parser.add_argument("--threads", type=int, default=50000, help="并发线程数 (默认50000)")
    parser.add_argument("--duration", type=int, default=10, help="测试持续时间（秒） (默认10秒)")

    # 解析命令行参数
    args = parser.parse_args()

    # 解析 IP 和端口
    try:
        server_ip, server_port = args.address.split(":")
        server_port = int(server_port)  # 将端口转换为整数
    except ValueError:
        print("输入格式不正确，请使用 ip:port 格式，例如 127.0.0.1:12345")
        exit(1)

    # 设置线程数量和测试持续时间
    thread_count = args.threads
    duration = args.duration

    # 创建两个线程来同时运行 TCP 和 UDP 测试
    tcp_thread = threading.Thread(target=run_tcp_test, args=(server_ip, server_port, duration, thread_count))
    udp_thread = threading.Thread(target=run_udp_test, args=(server_ip, server_port, duration, thread_count))

    # 启动 TCP 和 UDP 线程
    tcp_thread.start()
    udp_thread.start()

    # 等待两个测试完成
    tcp_thread.join()
    udp_thread.join()

    print("TCP 和 UDP 流量测试同时完成。")
