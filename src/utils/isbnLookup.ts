export interface BookLookupResult {
  isbn: string;
  title?: string;
  author?: string;
  genre?: string;
  notes?: string;
  found: boolean;
}

/**
 * Searches for book details by ISBN from public book APIs:
 * 1. BrasilAPI (best for Brazilian ISBNs)
 * 2. Google Books API
 * 3. Open Library API
 */
export async function lookupBookByISBN(rawCode: string): Promise<BookLookupResult> {
  const cleanIsbn = rawCode.replace(/[^0-9X]/gi, '');

  if (!cleanIsbn || (cleanIsbn.length !== 10 && cleanIsbn.length !== 13)) {
    return { isbn: rawCode, found: false };
  }

  // 1. Try BrasilAPI
  try {
    const res = await fetch(`https://brasilapi.com.br/api/isbn/v1/${cleanIsbn}`);
    if (res.ok) {
      const data = await res.json();
      const author = Array.isArray(data.authors) ? data.authors.join(', ') : data.authors || '';
      return {
        isbn: cleanIsbn,
        title: data.title || '',
        author: author,
        genre: data.subjects?.[0] || 'Literatura',
        notes: data.synopsis ? data.synopsis.slice(0, 160) + '...' : '',
        found: true,
      };
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Try Google Books API
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
    if (res.ok) {
      const data = await res.json();
      if (data.totalItems > 0 && data.items?.[0]?.volumeInfo) {
        const info = data.items[0].volumeInfo;
        const author = Array.isArray(info.authors) ? info.authors.join(', ') : '';
        const genre = Array.isArray(info.categories) ? info.categories[0] : 'Literatura';
        return {
          isbn: cleanIsbn,
          title: info.title || '',
          author: author,
          genre: genre,
          notes: info.description ? info.description.slice(0, 160) + '...' : '',
          found: true,
        };
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 3. Try Open Library
  try {
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
    if (res.ok) {
      const data = await res.json();
      const key = `ISBN:${cleanIsbn}`;
      if (data[key]) {
        const info = data[key];
        const author = Array.isArray(info.authors) ? info.authors.map((a: { name: string }) => a.name).join(', ') : '';
        return {
          isbn: cleanIsbn,
          title: info.title || '',
          author: author,
          genre: info.subjects?.[0]?.name || 'Literatura',
          notes: '',
          found: true,
        };
      }
    }
  } catch {
    // Not found in Open Library
  }

  return {
    isbn: cleanIsbn,
    found: false,
  };
}
