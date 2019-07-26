#! /usr/bin/env python
# -*- coding: utf-8 -*-

import redis as _redis


class MultiRedis():
    """支持多 Redis 客户端的 flask 插件"""

    def __init__(self, **kwargs):
        self.kw = kwargs
        self._redis_dict = {}

    def init_app(self, app):
        redis_url_dic = app.config.get('REDIS_URLS')
        for name, redis_url in redis_url_dic.items():
            redis_client = _redis.StrictRedis.from_url(redis_url, self.kw)
            self._redis_dict[name] = redis_client

        if not hasattr(app, 'extensions'):
            app.extensions = {}
        app.extensions['redis'] = self

    @property
    def keys(self):
        return self._redis_dict.keys()

    def __getitem__(self, name):
        return self._redis_dict[name]

    def __setitem__(self, name, value):
        raise NotImplementedError('Can not set redis client by __setitem__, '
                                  'you should use config instead!')
