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

