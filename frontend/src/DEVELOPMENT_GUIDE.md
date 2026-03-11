# Geliştirme Notu — Canvas Editörü

## Mimari Özeti

- **State**: Zustand (useEditorStore, useTemplateStore)
- **Canvas**: react-rnd tabanlı, tüm koordinatlar % cinsinden
- **PDF**: html2canvas + jsPDF (usePrinter.ts)
- **Depolama**: localStorage persist

## Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| hooks/usePrinter.ts | Tüm PDF/ZIP üretim mantığı |
| store/useEditorStore.ts | Canvas state (bellekte) |
| store/useTemplateStore.ts | Şablon listesi (localStorage) |
| utils/htmlGenerator.ts | Template → HTML (artık yalnızca serializeTemplateForPDF için) |
| components/editor/Canvas.tsx | Viewport, kılavuzlar, snap, kısayollar |
| components/editor/DraggableItem.tsx | Element renderer |

## Değişken Sistemi

Şablonlarda desteklenen değişkenler:
- [recipient.name]
- [recipient.surname]
- [certificate.success_rate]

Toplu üretimde Excel sütunları Levenshtein mesafesi ile bu değişkenlere otomatik eşlenir.

## PDF Üretim Akışı

```
renderTemplateToPDFBlob(template, data)
  1. Off-screen div oluştur
  2. Elements → absolute positioned DOM
  3. Görseller yüklenene bekle
  4. html2canvas → JPEG
  5. jsPDF → A4 blob
```

Toplu üretimde her kayıt için ayrı blob üretilir, JSZip ile paketlenir.
