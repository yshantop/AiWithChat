import CryptoJS from 'crypto-js'

export default class SparkApi {
  constructor(options) {
    this.appId = options.appId
    this.apiKey = options.apiKey
    this.apiSecret = options.apiSecret
    this.model = options.model || 'lite'
    this.url = this.model === 'lite' 
      ? 'wss://spark-api.xf-yun.com/v1.1/chat'
      : 'wss://spark-api.xf-yun.com/v3.5/chat'
    this.onMessage = options.onMessage
    this.onError = options.onError
    this.onClose = options.onClose
  }

  // 创建鉴权url
  createUrl() {
    const date = new Date().toUTCString()
    const host = new URL(this.url).host
    const path = new URL(this.url).pathname

    // 进行hmac-sha256进行加密
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)

    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authorization = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))

    // 将请求的鉴权参数组合为字典
    const v = {
      authorization: authorization,
      date: date,
      host: host
    }

    // 拼接鉴权参数，生成url
    const url = this.url + '?' + new URLSearchParams(v).toString()
    return url
  }

  // 发送消息
  sendMessage(content) {
    return new Promise((resolve, reject) => {
      const url = this.createUrl()
      const ws = new WebSocket(url)

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.onMessage(data)
      }

      ws.onerror = (error) => {
        this.onError(error)
        reject(error)
      }

      ws.onclose = () => {
        this.onClose()
      }

      ws.onopen = () => {
        const params = {
          header: {
            app_id: this.appId
          },
          parameter: {
            chat: {
              domain: this.model === 'lite' ? "lite" : "generalv3.5",
              temperature: 0.5,
              max_tokens: 4096,
              top_k: 4
            }
          },
          payload: {
            message: {
              text: [
                {
                  role: "user",
                  content: content
                }
              ]
            }
          }
        }

        ws.send(JSON.stringify(params))
        resolve()
      }
    })
  }
}
