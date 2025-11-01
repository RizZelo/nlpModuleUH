"""
Enhanced CV Parser - Supports multiple formats with normalization
Handles: PDF, DOCX, TXT, ODT, LaTeX, HTML
Produces: Clean HTML + Plain Text + Structured Metadata
"""

import re
import os
import json
import subprocess
from typing import Optional, Dict, Tuple
from pathlib import Path

# Import libraries
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    from docx import Document
except ImportError:
    Document = None

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import mammoth  # Better DOCX to HTML
except ImportError:
    mammoth = None

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None


class CVParser:
    """Enhanced CV parser with multi-format support"""
    
    SUPPORTED_FORMATS = ['.pdf', '.docx', '.doc', '.txt', '.odt', '.tex', '.html', '.rtf']
    
    def __init__(self):
        self.check_dependencies()
    
    def check_dependencies(self):
        """Check which parsers are available"""
        self.has_mammoth = mammoth is not None
        self.has_pandoc = self._check_pandoc()
        self.has_pymupdf = fitz is not None
        self.has_beautifulsoup = BeautifulSoup is not None
        
        print("🔧 Available parsers:")
        print(f"   - Mammoth (DOCX→HTML): {'✅' if self.has_mammoth else '❌'}")
        print(f"   - Pandoc (Universal): {'✅' if self.has_pandoc else '❌'}")
        print(f"   - PyMuPDF (PDF): {'✅' if self.has_pymupdf else '❌'}")
        print(f"   - BeautifulSoup (HTML): {'✅' if self.has_beautifulsoup else '❌'}")
    
    def _check_pandoc(self) -> bool:
        """Check if Pandoc is installed"""
        try:
            subprocess.run(['pandoc', '--version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def parse_document(self, file_path: str) -> Dict:
        """
        Parse any supported CV format and return normalized data
        
        Returns:
            {
                'html': 'Clean semantic HTML',
                'plain_text': 'Plain text version',
                'metadata': {
                    'format': 'docx',
                    'pages': 2,
                    'word_count': 450,
                    'has_images': False
                },
                'structured': {
                    'sections': [...],
                    'contacts': {...},
                    'dates': [...]
                }
            }
        """
        print(f"\n🔍 Parsing: {file_path}")
        
        if not os.path.exists(file_path):
            return {'error': 'File not found'}
        
        ext = os.path.splitext(file_path)[1].lower()
        file_size = os.path.getsize(file_path)
        
        print(f"📄 Format: {ext}, Size: {file_size} bytes")
        
        if ext not in self.SUPPORTED_FORMATS:
            return {'error': f'Unsupported format: {ext}'}
        
        # Route to appropriate parser
        try:
            if ext == '.docx' and self.has_mammoth:
                result = self._parse_docx_with_mammoth(file_path)
            elif ext in ['.odt', '.tex', '.rtf'] and self.has_pandoc:
                result = self._parse_with_pandoc(file_path, ext)
            elif ext == '.pdf':
                result = self._parse_pdf(file_path)
            elif ext == '.html':
                result = self._parse_html(file_path)
            elif ext == '.txt':
                result = self._parse_txt(file_path)
            elif ext == '.docx' and Document:
                result = self._parse_docx_legacy(file_path)
            else:
                return {'error': 'No suitable parser available'}
            
            # Add metadata
            result['metadata']['original_format'] = ext
            result['metadata']['file_size_bytes'] = file_size
            
            # Extract structured data from HTML/text
            result['structured'] = self._extract_structured_data(
                result.get('html', ''),
                result.get('plain_text', '')
            )
            
            print(f"✅ Parsing complete: {len(result.get('plain_text', ''))} chars")
            return result
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}
    
    def _parse_docx_with_mammoth(self, file_path: str) -> Dict:
        """Use Mammoth to convert DOCX to clean HTML"""
        print("   📄 Using Mammoth for DOCX→HTML conversion...")
        
        with open(file_path, 'rb') as docx_file:
            result = mammoth.convert_to_html(docx_file)
            html = result.value
            messages = result.messages
        
        # Extract plain text from HTML
        plain_text = self._html_to_text(html)
        
        return {
            'html': html,
            'plain_text': plain_text,
            'metadata': {
                'parser': 'mammoth',
                'warnings': [m.message for m in messages if m.type != 'info'],
                'word_count': len(plain_text.split())
            }
        }
    
    def _parse_with_pandoc(self, file_path: str, ext: str) -> Dict:
        """Use Pandoc for universal conversion"""
        print(f"   🔄 Using Pandoc for {ext}→HTML conversion...")
        
        try:
            # Pandoc to HTML
            html_output = subprocess.run(
                ['pandoc', '-f', ext[1:], '-t', 'html', file_path],
                capture_output=True,
                text=True,
                check=True
            )
            html = html_output.stdout
            
            # Pandoc to plain text
            text_output = subprocess.run(
                ['pandoc', '-f', ext[1:], '-t', 'plain', file_path],
                capture_output=True,
                text=True,
                check=True
            )
            plain_text = text_output.stdout
            
            return {
                'html': html,
                'plain_text': plain_text,
                'metadata': {
                    'parser': 'pandoc',
                    'word_count': len(plain_text.split())
                }
            }
        except subprocess.CalledProcessError as e:
            raise Exception(f"Pandoc conversion failed: {e.stderr}")
    
    def _parse_pdf(self, file_path: str) -> Dict:
        """Parse PDF with PyMuPDF"""
        print("   📄 Using PyMuPDF for PDF extraction...")
        
        if not self.has_pymupdf:
            return {'error': 'PyMuPDF not installed'}
        
        text_content = []
        html_parts = []
        
        with fitz.open(file_path) as doc:
            num_pages = len(doc)
            
            for page_num, page in enumerate(doc):
                # Extract text
                text = page.get_text()
                text_content.append(text)
                
                # Try to extract HTML with formatting
                html = page.get_text("html")
                html_parts.append(html)
        
        plain_text = '\n\n'.join(text_content)
        html = '\n'.join(html_parts)
        
        # Clean HTML
        html = self._clean_pdf_html(html)
        
        return {
            'html': html,
            'plain_text': plain_text,
            'metadata': {
                'parser': 'pymupdf',
                'pages': num_pages,
                'word_count': len(plain_text.split())
            }
        }
    
    def _parse_html(self, file_path: str) -> Dict:
        """Parse HTML file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        plain_text = self._html_to_text(html)
        
        return {
            'html': html,
            'plain_text': plain_text,
            'metadata': {
                'parser': 'html',
                'word_count': len(plain_text.split())
            }
        }
    
    def _parse_txt(self, file_path: str) -> Dict:
        """Parse plain text file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            plain_text = f.read()
        
        # Convert to simple HTML
        html = self._text_to_html(plain_text)
        
        return {
            'html': html,
            'plain_text': plain_text,
            'metadata': {
                'parser': 'txt',
                'word_count': len(plain_text.split())
            }
        }
    
    def _parse_docx_legacy(self, file_path: str) -> Dict:
        """Fallback DOCX parser using python-docx"""
        print("   📄 Using python-docx (legacy) for DOCX...")
        
        doc = Document(file_path)
        
        text_parts = []
        html_parts = ['<div>']
        
        for para in doc.paragraphs:
            text_parts.append(para.text)
            
            # Convert to HTML based on style
            style = para.style.name.lower()
            if 'heading' in style:
                level = ''.join(filter(str.isdigit, style)) or '2'
                html_parts.append(f'<h{level}>{para.text}</h{level}>')
            else:
                html_parts.append(f'<p>{para.text}</p>')
        
        html_parts.append('</div>')
        
        plain_text = '\n'.join(text_parts)
        html = '\n'.join(html_parts)
        
        return {
            'html': html,
            'plain_text': plain_text,
            'metadata': {
                'parser': 'python-docx',
                'word_count': len(plain_text.split())
            }
        }
    
    def _html_to_text(self, html: str) -> str:
        """Convert HTML to plain text"""
        if not self.has_beautifulsoup:
            # Simple regex fallback
            text = re.sub(r'<[^>]+>', '', html)
            return text.strip()
        
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator='\n', strip=True)
    
    def _text_to_html(self, text: str) -> str:
        """Convert plain text to simple HTML"""
        lines = text.split('\n')
        html_lines = ['<div>']
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect headings (all caps or short lines)
            if line.isupper() and len(line) < 50:
                html_lines.append(f'<h2>{line}</h2>')
            elif len(line) < 60 and not line.endswith(('.', ',')):
                html_lines.append(f'<h3>{line}</h3>')
            else:
                html_lines.append(f'<p>{line}</p>')
        
        html_lines.append('</div>')
        return '\n'.join(html_lines)
    
    def _clean_pdf_html(self, html: str) -> str:
        """Clean messy PDF HTML output"""
        if not self.has_beautifulsoup:
            return html
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove style tags, scripts
        for tag in soup(['style', 'script']):
            tag.decompose()
        
        return str(soup)
    
    def _extract_structured_data(self, html: str, plain_text: str) -> Dict:
        """Extract structured information from parsed CV"""
        
        structured = {
            'sections': self._detect_sections(plain_text),
            'contacts': self._extract_contacts(plain_text),
            'dates': self._extract_dates(plain_text),
            'skills': self._extract_skills(plain_text),
            'bullet_points': self._extract_bullets(html, plain_text)
        }
        
        return structured
    
    def _detect_sections(self, text: str) -> list:
        """Detect CV sections (Experience, Education, Skills, etc.)"""
        sections = []
        
        section_keywords = [
            'experience', 'work history', 'employment',
            'education', 'academic', 'qualifications',
            'skills', 'competencies', 'expertise',
            'summary', 'profile', 'objective',
            'projects', 'achievements', 'certifications'
        ]
        
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            for keyword in section_keywords:
                if keyword in line_lower and len(line.strip()) < 50:
                    sections.append({
                        'title': line.strip(),
                        'type': keyword,
                        'line_number': i
                    })
                    break
        
        return sections
    
    def _extract_contacts(self, text: str) -> Dict:
        """Extract contact information"""
        contacts = {}
        
        # Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            contacts['email'] = email_match.group(0)
        
        # Phone
        phone_match = re.search(r'[\+\d][\d\s\-\(\)]{9,}', text)
        if phone_match:
            contacts['phone'] = phone_match.group(0).strip()
        
        # LinkedIn
        linkedin_match = re.search(r'linkedin\.com/in/[\w\-]+', text, re.IGNORECASE)
        if linkedin_match:
            contacts['linkedin'] = linkedin_match.group(0)
        
        # GitHub
        github_match = re.search(r'github\.com/[\w\-]+', text, re.IGNORECASE)
        if github_match:
            contacts['github'] = github_match.group(0)
        
        return contacts
    
    def _extract_dates(self, text: str) -> list:
        """Extract all dates (for consistency checking)"""
        date_patterns = [
            r'\b\d{4}\s*[-–]\s*\d{4}\b',  # 2020-2023
            r'\b\d{4}\s*[-–]\s*Present\b',  # 2020-Present
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b',  # Jan 2020
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            dates.extend([m.group(0) for m in matches])
        
        return dates
    
    def _extract_skills(self, text: str) -> list:
        """Extract potential skills (basic keyword extraction)"""
        # Common skill keywords
        skill_keywords = [
            'python', 'java', 'javascript', 'react', 'node', 'sql',
            'aws', 'azure', 'docker', 'kubernetes', 'git',
            'machine learning', 'data analysis', 'agile', 'scrum'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_bullets(self, html: str, plain_text: str) -> list:
        """Extract bullet points from CV"""
        bullets = []
        
        # From HTML <li> tags
        if self.has_beautifulsoup and html:
            soup = BeautifulSoup(html, 'html.parser')
            for li in soup.find_all('li'):
                bullets.append(li.get_text(strip=True))
        
        # From plain text (lines starting with • - *)
        for line in plain_text.split('\n'):
            line = line.strip()
            if line and line[0] in ['•', '-', '*', '·']:
                bullets.append(line[1:].strip())
        
        return bullets


# Helper function for backward compatibility
def parse_document(file_path: str) -> Optional[str]:
    """Legacy function - returns plain text only"""
    parser = CVParser()
    result = parser.parse_document(file_path)
    
    if 'error' in result:
        print(f"❌ Error: {result['error']}")
        return None
    
    return result.get('plain_text')


if __name__ == "__main__":
    import sys
    
    print("="*60)
    print("ENHANCED CV PARSER TEST")
    print("="*60)
    
    parser = CVParser()
    
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
    else:
        test_file = input("\n📁 Enter CV file path: ").strip()
    
    result = parser.parse_document(test_file)
    
    if 'error' in result:
        print(f"\n❌ ERROR: {result['error']}")
    else:
        print(f"\n✅ SUCCESS!")
        print(f"\n📊 Metadata:")
        print(json.dumps(result['metadata'], indent=2))
        print(f"\n📄 Structured Data:")
        print(f"   Sections found: {len(result['structured']['sections'])}")
        print(f"   Contacts: {result['structured']['contacts']}")
        print(f"   Dates found: {len(result['structured']['dates'])}")
        print(f"   Bullets: {len(result['structured']['bullet_points'])}")
        print(f"\n📝 Plain Text Preview (first 300 chars):")
        print(result['plain_text'][:300])