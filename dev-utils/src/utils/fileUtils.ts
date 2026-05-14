export function downloadFile(content: string, filename: string): void {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function getFilenameWithoutExtension(filename: string): string {
  return filename.split('.').slice(0, -1).join('.');
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function isTextFile(filename: string): boolean {
  const textExtensions = [
    'txt',
    'js',
    'ts',
    'jsx',
    'tsx',
    'json',
    'xml',
    'html',
    'htm',
    'css',
    'scss',
    'md',
    'markdown',
    'yaml',
    'yml',
    'sql',
    'py',
    'java',
    'c',
    'cpp',
    'cs',
    'php',
    'rb',
    'go',
    'rs',
    'sh',
    'bash',
    'env',
    'log',
    'csv',
    'tsv',
  ];

  const ext = getFileExtension(filename).toLowerCase();
  return textExtensions.includes(ext);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateUniqueFilename(baseName: string, existingNames: string[]): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  const nameParts = baseName.split('.');
  const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
  const nameWithoutExt = nameParts.join('.');

  let counter = 1;
  while (existingNames.includes(`${nameWithoutExt} (${counter})${extension}`)) {
    counter++;
  }

  return `${nameWithoutExt} (${counter})${extension}`;
}
