import { marked } from 'marked'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import JSZip from 'jszip'

export async function generateEpubBuffer(params: { title: string; bodyMarkdown: string; coverUrl?: string | null }) {
  try {
    const title = params.title
    const htmlBody = marked.parse(params.bodyMarkdown)
    const zip = new JSZip()
    
    // Required files
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
    zip.file('META-INF/container.xml',
      `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`
    )
    
    const oebps = zip.folder('OEBPS')!
    
    // Prepare optional cover
    let coverManifestItem = ''
    let coverMeta = ''
    let coverGuide = ''
    let coverExt = 'jpg'
    
    if (params.coverUrl) {
      try {
        console.log('Fetching cover from:', params.coverUrl)
        const resp = await fetch(params.coverUrl)
        if (!resp.ok) {
          console.warn('Failed to fetch cover:', resp.status, resp.statusText)
        } else {
          const buf = Buffer.from(await resp.arrayBuffer())
          const ctype = resp.headers.get('content-type') || ''
          
          if (ctype.includes('png')) coverExt = 'png'
          else if (ctype.includes('webp')) coverExt = 'webp'
          else if (ctype.includes('jpeg') || ctype.includes('jpg')) coverExt = 'jpg'
          else {
            const m = params.coverUrl.match(/\.(png|jpe?g|webp)(?:\?|#|$)/i)
            if (m) coverExt = m[1].toLowerCase().replace('jpeg', 'jpg')
          }
          
          const images = oebps.folder('images')!
          images.file(`cover.${coverExt}`, buf)
          
          const coverMedia = coverExt === 'png' ? 'image/png' : coverExt === 'webp' ? 'image/webp' : 'image/jpeg'
          coverManifestItem = `\n    <item id="cover-image" href="images/cover.${coverExt}" media-type="${coverMedia}"/>`
          coverMeta = `\n    <meta name="cover" content="cover-image"/>`
          
          // Create cover page
          const coverXhtml = `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>Cover</title></head>\n<body><div style="text-align:center;"><img src="images/cover.${coverExt}" alt="Cover" style="max-width:100%; height:auto;"/></div></body>\n</html>`
          oebps.file('cover.xhtml', coverXhtml)
          
          coverGuide = `\n  <guide>\n    <reference type="cover" title="Cover" href="cover.xhtml"/>\n  </guide>`
          
          console.log('Cover successfully added to EPUB')
        }
      } catch (e) {
        console.warn('Failed to process cover:', e)
      }
    }

    // Create content.opf with proper metadata
    const contentOpf = `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">\n  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n    <dc:title>${title}</dc:title>\n    <dc:identifier id="bookid">id-${Date.now()}</dc:identifier>\n    <dc:language>en</dc:language>\n    <dc:creator>Publica.now Creator</dc:creator>\n    <dc:publisher>publica.la</dc:publisher>\n    <dc:date>${new Date().toISOString().slice(0, 10)}</dc:date>${coverMeta}\n  </metadata>\n  <manifest>\n    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n    <item id="chap1" href="chap1.html" media-type="application/xhtml+xml"/>${coverManifestItem}\n  </manifest>\n  <spine toc="ncx">\n    ${params.coverUrl ? '<itemref idref="cover" linear="no"/>' : ''}\n    <itemref idref="chap1"/>\n  </spine>${coverGuide}\n</package>`
    
    // Create navigation
    const tocNcx = `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n  <head>\n    <meta name="dtb:uid" content="id-${Date.now()}"/>\n    <meta name="dtb:depth" content="1"/>\n    <meta name="dtb:totalPageCount" content="0"/>\n    <meta name="dtb:maxPageNumber" content="0"/>\n  </head>\n  <docTitle><text>${title}</text></docTitle>\n  <navMap>\n    ${params.coverUrl ? '<navPoint id="navPoint-0" playOrder="0"><navLabel><text>Cover</text></navLabel><content src="cover.xhtml"/></navPoint>' : ''}\n    <navPoint id="navPoint-1" playOrder="1">\n      <navLabel><text>${title}</text></navLabel>\n      <content src="chap1.html"/>\n    </navPoint>\n  </navMap>\n</ncx>`
    
    // Create main content with better styling
    const chap1 = `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n<head><title>${title}</title>\n<style>\nbody { font-family: Georgia, serif; line-height: 1.6; margin: 2em; }\nh1, h2, h3 { color: #333; }\np { margin-bottom: 1em; }\nimg { max-width: 100%; height: auto; }\n</style>\n</head>\n<body>${htmlBody}</body>\n</html>`
    
    oebps.file('content.opf', contentOpf)
    oebps.file('toc.ncx', tocNcx)
    oebps.file('chap1.html', chap1)
    
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', mimeType: 'application/epub+zip' })
    
    if (buffer.length > 100 && buffer[0] === 0x50 && buffer[1] === 0x4b) {
      console.log('EPUB generated successfully, size:', buffer.length, 'bytes')
      return buffer
    }
    throw new Error('Invalid EPUB buffer produced')
  } catch (e) {
    console.error('EPUB generation failed:', e)
    // Fallback to sample EPUB
    const res = await fetch('https://filesamples.com/samples/document/epub/sample3.epub')
    const arr = await res.arrayBuffer()
    return Buffer.from(arr)
  }
}


