if [ "$IS_PRIVATE_ENV"x = "TRUE"x ]; then
    echo "Window.IS_PRIVATE_ENV = 'TRUE';" > /var/excel-copilot/env.js # 将 Window.IS_PRIVATE_ENV = 'TRUE' 这段代码写入 public/env.js 中
fi
#!/bin/sh
cd /var/excel-copilot
nginx -g 'daemon off;'
while true  #重要！！！保证容器不直接退出！！！
do
    sleep 2
done
