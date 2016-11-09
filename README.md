# Gulpfile

gulp中的gulpfile配置，配置文件有注释的，其中几个讲解一下：

## 任务介绍

**sprite or delSprite**: 合并雪碧图 和 清理雪碧图

**testRev**: 替换html文件里面JS和CSS版本号

**clean**: 清理项目中的生成目录所有文件和版本号对应文件的json

**$.argv**: 为true的时候为生产模式，为false的时候为开发模式~开发模式不压缩，不合并，生产反之

**concats**: 这个任务单独使用合并压缩重新命名，考虑我们在项目中可能会经常变动需求



