# Screenshot Comparison
## Intro
This tool stores the screenshot urls and display in comparison mode.
Javascript for comparison is written by PTP devops. All credit goes to them.

## Structure
```
├── app (Web server for store and request api etc)
│   └── server
│       └── views.py
├── config.py.default
├── etc
├── manager.py
├── requirements.txt
├── utils
│   └── redis
└── web (Website static file)
    ├── checker.html
    ├── css
    ├── generator.html
    ├── image
    └── js

```
## Enviroment
- Python3.7
- Redis
- Supervisor
- Packages in requirement.txt
- virtualenv (Recommand)

## Deploy
Nginx Config
```
server{
        listen 80;
        server_name comparison.sample.cc;
        rewrite ^(.*) https://comparison.sample.cc$1 permanent;
}

server {
        listen 443 ssl;
        listen [::]:443 ssl;
        ssl_certificate     /home/duck/cert/23467031_comparison.sample.cc.crt;
        ssl_certificate_key /home/duck/cert/23467031_comparison.sample.cc.key;
        
        set $root_dir /home/duck/vhost/ScreenshotComparison/web;
        root $root_dir;
        index index.html index.htm index.nginx-debian.html;
        server_name comparison.sample.cc;
		
	# Static HTML or JS files
        location / {
                try_files $uri.html $uri/ =404;
        }
        location ~* \.js$ {
                root $root_dir;
                expires 30d;
        }
        location ~* \.css$ {
                root $root_dir;
                expires 30d;
        }
        location ~* \.png$ {
                root $root_dir;
                expires 30d;
        }
		
		
	# Pass the request to a uwsgi server port/sock
        location /api/ {
                proxy_pass http://127.0.0.1:5050/api/;
        }
}
```

Running in dev:
```
# Before running, you need those setup:
redis-server
python3.7
virtualenv (virtualenvwrapper)

# Setup required packages (Switch to your virtualenv first)
pip install -r requirements.txt

# Create a config file
cp config.py.default config.py
# Edit your site domain
vim config.py

# Run
python manage.py runserver
```

Running in production environments:
- Backend server is supervised by supervisor, so you need:
```
sudo apt install supervisor
```
- Add supervisor config for screenshot comparison server
```
sudo vim /etc/supervisor/conf.d/comparison.conf
```
like:
```
[program:comparison-5050]
command=/home/duck/.virtualenvs/comparison/bin/gunicorn --bind 0.0.0.0:5050 manager:app
directory=/home/duck/vhost/ScreenshotComparison
stdout_logfile=/home/duck/log/supervisor/comparison.stdout.log
stderr_logfile=/home/duck/log/supervisor/comparison.stderr.log
stdout_logfile_maxbytes=1MB
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stopsignal=QUIT
```
- Run it with supervisor:
```
sudo supervisorctl update
or
sudo supervisorctl restart comparison-5050
```

## 碎碎念
由于要赶去复习CS的东西了实在是太忙了，还有好多想补充的功能都没有来得及做。其实主要是前端方面的内容不太熟悉，也没在学习重点内，所以一直拖着orz
### todo
#### High Priority(AKA 有趣的东西)
- 对比图展示页面支持实时开关/屏蔽某一列，如Source vs Filterd vs Encode时屏蔽Filterd列
- Block compare column in real time, like block "Filtered" column when watching "Source vs Filtered vs Encode" comparison.
- 对比图展示页面评分系统。支持对分享链接内的截图评分
- Comparison rating system.
- 对比图展示页面评论系统
- Comment section.
#### Normal Priority(AKA 正常需要做的东西)
- 对比图提交页面TextArea优化。目前为网上搜索的TextArea样式，比较简陋和不友好
- Optimize input TextArea style.
- 后端安全。后端代码花了3个小时构建出来的，再后面用来几天下班时间修修补补，还有很多问题要处理否则有注入风险
- Web Services Security.
- 存储改用MySQL。目前架构上使用Redis作为存储容器，配合评分系统、评论系统等改动最好还是一并迁移至MySQL处理
- DB Migration(MySQL).
#### Low Priority(AKA 没什么卵用的东西)
- 用户系统/注册登陆
- User system(Register/Login).
- 界面优化
- UI.

### 其他
- 上面的todo list如果有相应的前端配合都是很快可以写完的，目前前端的方向没有时间深入调整，如果有什么好的想法或者实现欢迎联系/提PR/提issue

![Wechat](https://ptpimg.me/x8667v.png "Wechat") ![QQ](https://ptpimg.me/nez32x.png "QQ")





