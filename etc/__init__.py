# -*- coding: utf-8 -*-
"""
    公用基础配置，受版本控制，部署时无需更改
"""
import os

from config import *

"""
----------------------------------------------------------------------------------
    基础配置
----------------------------------------------------------------------------------
"""
# 项目名称
PROJECT_NAME = 'server-status-python'
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class RedisConfig:
    REDIS_URLS = REDIS_URLS


class AppConfig(RedisConfig):
    PROJECT_NAME = PROJECT_NAME
    DEBUG = DEBUG
    DEV_HOST = DEV_HOST
    DEV_PORT = DEV_PORT
