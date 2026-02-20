import { marked } from 'marked'
import JSZip from 'jszip'

interface EpubContent {
  title: string
  author: string
  description: string
  content: string
  language: string
  publicationDate: string
  coverImage?: string // Base64 encoded image
}

export class EpubGenerator {
  async generateEpub(data: EpubContent): Promise<Blob> {
    try {
      console.log('Generating EPUB with jszip for:', data.title)
      
      // Convert markdown to HTML
      const htmlContent = marked(data.content)
      
      // Create a new ZIP file
      const zip = new JSZip()
      
      // IMPORTANT: mimetype must be the first file in the EPUB
      // This is a requirement for EPUB validation
      zip.file('mimetype', 'application/epub+zip')
      
      // Add META-INF/container.xml (required for EPUB)
      const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
      
      zip.file('META-INF/container.xml', containerXml)
      
      // Add content.opf (EPUB package file)
      const currentDate = new Date().toISOString().slice(0, 19) + 'Z'
      const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
    <dc:identifier id="uid">${data.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}</dc:identifier>
    <dc:title>${data.title}</dc:title>
    <dc:creator>${data.author}</dc:creator>
    <dc:description>${data.description}</dc:description>
    <dc:language>${data.language}</dc:language>
    <dc:date>${data.publicationDate}</dc:date>
    <dc:publisher>publica.now</dc:publisher>
    <dc:rights>Copyright © ${new Date().getFullYear()}</dc:rights>
    <dcterms:modified>${currentDate}</dcterms:modified>
    ${data.coverImage ? '<meta property="cover" content="cover-image"/>' : ''}
  </metadata>
  
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${data.coverImage ? '<item id="cover-image" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>' : ''}
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  
  <spine>
    <itemref idref="nav"/>
    ${data.coverImage ? '<itemref idref="cover-image"/>' : ''}
    <itemref idref="content"/>
  </spine>
</package>`
      
      zip.file('OEBPS/content.opf', contentOpf)
      
      // Add navigation file
      const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navigation</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${data.coverImage ? '<li><a href="cover.xhtml">Cover</a></li>' : ''}
      <li><a href="content.xhtml">${data.title}</a></li>
    </ol>
  </nav>
</body>
</html>`
      
      zip.file('OEBPS/nav.xhtml', navXhtml)
      
      // Add cover page if cover image exists
      if (data.coverImage) {
        const coverXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Cover</title>
  <style>
    body { margin: 0; padding: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .cover-container { text-align: center; }
    .cover-image { max-width: 100%; max-height: 80vh; }
    .cover-text { margin-top: 20px; }
    .cover-text h1 { font-size: 2em; margin: 0; }
    .cover-text .author { font-size: 1.2em; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="cover-container">
    <img src="cover.jpg" alt="Cover" class="cover-image"/>
    <div class="cover-text">
      <h1>${data.title}</h1>
      <p class="author">By ${data.author}</p>
    </div>
  </div>
</body>
</html>`
        
        zip.file('OEBPS/cover.xhtml', coverXhtml)
        
        // Add cover image (remove any data:image/*;base64, prefix)
        const coverImageData = data.coverImage.replace(/^data:image\/[^;]+;base64,/, '')
        zip.file('OEBPS/cover.jpg', coverImageData, { base64: true })
      }
      
      // Add main content
      const contentXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${data.title}</title>
</head>
<body>
  <h1>${data.title}</h1>
  <p><em>By ${data.author}</em></p>
  <p><em>${data.description}</em></p>
  <hr/>
  ${htmlContent}
</body>
</html>`
      
      zip.file('OEBPS/content.xhtml', contentXhtml)
      
      // Generate the EPUB file
      const epubBlob = await zip.generateAsync({ 
        type: 'blob',
        mimeType: 'application/epub+zip',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })
      
      console.log('EPUB generated successfully with jszip and cover image')
      
      return epubBlob
      
    } catch (error) {
      console.error('EPUB generation failed:', error)
      console.log('Falling back to text-based approach...')
      
      // Fallback to text-based approach if generation fails
      let epubText = `EPUB Generation Failed - Fallback Text
Title: ${data.title}
Author: ${data.author}
Date: ${data.publicationDate}
Language: ${data.language}

Cover Image: ${data.coverImage ? '✓ Included' : '✗ Not provided (will use fallback)'}

Content:
${data.content}

Generated by publica.now on ${new Date().toISOString()}
Error: ${error instanceof Error ? error.message : 'Unknown error'}`

      return new Blob([epubText], { type: 'text/plain' })
    }
  }
}
