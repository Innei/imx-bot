# imx-bot

一个自用的 QQ 机器人，提供以下功能。持续更新中...

- GitHub Webhook 推送
- [Mix Space](https://github.com/mx-space) 事件推送
- 早安晚安
- 欢迎新人
- 错误通知
- 工具 (IP Query, Base64, MD5)
- 复读机
- 第三方 NovelAI 绘图

## 示例

**交互式**

```
> /tool —md5 "111:"

< md5 结果: 5b1c3849efa2d27d3f1b9c63f1fb3a62
```

```
> /tool —base64 MQ== -d
< base64 解码结果: 1

> /tool —base64 1
< base64 编码结果: MQ==
```

```
> /tool —ip 110.143.148.18

< IP: 110.143.148.18
城市: 澳大利亚 - 澳大利亚
ISP: N/A
组织: N/A
范围: 110.140.0.0 - 110.143.255.255
```

```
> /mx_stat

< 来自 Mx Space 的状态信息：

当前有文章 99 篇，生活记录 99 篇，评论 334 条，友链 43 条，说说 27 条，速记 21 条。
未读评论 0 条，友链申请 0 条。
今日访问 197 次，最高在线 8 人，总计在线 234 人。
调用次数 1984607 次，当前在线 3 人。
```

**通知式**

```
> 晚安，早点睡哦！

若不爱你，死生无地。若不爱你，青魂可离。

```

```
> mx-server 发布了一个新版本 v3.24.5，前往查看:
https://github.com/mx-space/mx-server/releases/tag/v3.24.5
```

```
> Innei 向 mx-server 提交了一个更改

release: v3.24.5
```

```
> @Innei mx-server CI 挂了！！！！
查看原因: https://github.com/mx-space/mx-server/runs/6054082406?check_suite_focus=true
```

```
> Innei 发布了新生活观察日记: 没有尽头的日子
心情: 悲哀	天气: 多云
不知不觉已经来上海两个月了，开始实习也已经一个半月了。

突然觉得时间过得好快，但是又过的好慢。自从小区被封，也快一个月了。我都不知道我也熬到了现在。但是未来的日子仍然是个未知数，没人知道什么时候能解封，小区天天有人被确诊，拉走一车一车的小阳人，每天醒来就是重置 14 天，就是连「开端」都不敢这么拍吧。隔天进行一次核酸，也不知道下一个阳的会不会是自己，每天生活在这样的环境下，又要担心被拉走又要好好...

前往阅读: https://innei.ren/notes/114
```

```
> Apr 20, 2022, 10:15:27 PM GMT+8
[TypeError] The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received type number (1)
TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received type number (1)
    at new NodeError (node:internal/errors:371:5)
    at Function.from (node:buffer:322:9)
    at toolCommand (/Users/xiaoxun/github/innei-repo/app/dist/src/handlers/shared/commands/tool.js:33:28)
    at handleCommandMessage (/Users/xiaoxun/github/innei-repo/app/dist/src/handlers/shared/command.js:22:61)
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
    at async handleSingleMessage (/Users/xiaoxun/github/innei-repo/app/dist/src/handlers/group/single.js:13:32)
    at async groupMessageHandler (/Users/xiaoxun/github/innei-repo/app/dist/src/handlers/group/index.js:11:16)
    at async Client.<anonymous> (/Users/xiaoxun/github/innei-repo/app/dist/src/client.js:18:16)
```
