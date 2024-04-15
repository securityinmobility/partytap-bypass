import QrScanner from 'qr-scanner'
import crypto from 'crypto'
import { bech32 } from 'bech32'

function decodeLnUrl(lnurl) {
    // thanks to src from https://lnurl.fiatjaf.com/codec
    const words = bech32.decode(lnurl, 1023).words
    return Buffer.from(bech32.fromWords(words)).toString()
}

function decryptPin(encrypted, iv, key) {
    // thanks to ChatGPT and original python code from
    // https://github.com/BitcoinTaps/partytap/blob/main/tasks.py#L78
    const encryptedBuffer = Buffer.from(encrypted, 'hex')
    const ivBuffer = Buffer.from(iv, 'hex')
    const keyBuffer = Buffer.from(key.slice(0, 16), 'utf8')

    const decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer)
    const decrypted = decipher.update(encryptedBuffer, null, 'utf8')

    return decrypted.split(':')[1]
}

function handleScannedQr(code) {
    try {
        const text = code.data
        const url = new URL(decodeLnUrl(text))
        
        const key = location.hash.slice(1)
        const encrypted = url.searchParams.get('encrypted')
        const iv = url.searchParams.get('iv')
        const pin = decryptPin(encrypted, iv, key)

        alert(pin)
    } catch(e) {
        console.error(e)
    }
}

document.body.onload = function() {
    const videoElem = document.getElementById('scanner-vid')
    const qrScanner = new QrScanner(
        videoElem,
        handleScannedQr,
        { returnDetailedScanResult: true },
    )
    qrScanner.start()
}
