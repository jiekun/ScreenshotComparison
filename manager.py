#! /usr/bin/env python
# -*- coding: utf-8 -*-
from flask_script import Manager

from app import create_app
import config

app = create_app()
manager = Manager(app)


@manager.command
def debugserver(host=config.DEV_HOST, port=config.DEV_PORT):
    """启动测试服务器"""
    if isinstance(port, str) and port.isdigit():
        port = int(port)
    app.run(debug=True, host=host, port=port)


if __name__ == '__main__':
    manager.run()