"""
Resume/CV Parser Module
A simple script to extract and clean text from PDF, DOCX, and TXT files.
"""

import re
import os
from typing import Optional

# Import libraries for different file formats
try:
    import PyPDF2  # For PDF files
except ImportError:
    PyPDF2 = None

try:
    from docx import Document  # For DOCX files
except ImportError:
    Document = None


def parse_document(file_path: str) -> Optional[str]:
    """
    Parse a resume/CV file and extract clean text content.
    
    Args:
        file_path (str): Path to the document file (.pdf, .docx, or .txt)
    
    Returns:
        str: Cleaned text content from the document
        None: If parsing fails or file type is not supported
    """
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: File not found - {file_path}")
        return None
    
    # Get file extension to determine file type
    _, file_extension = os.path.splitext(file_path)
    file_extension = file_extension.lower()
    
    # Extract raw text based on file type
    try:
        if file_extension == '.pdf':
            raw_text = extract_text_from_pdf(file_path)
        elif file_extension == '.docx':
            raw_text = extract_text_from_docx(file_path)
        elif file_extension == '.txt':
            raw_text = extract_text_from_txt(file_path)
        else:
            print(f"Error: Unsupported file type - {file_extension}")
            return None
        
        # Check if text extraction was successful
        if raw_text is None:
            print("Error: Failed to extract text from document")
            return None
        
        # Clean the extracted text
        cleaned_text = clean_text(raw_text)
        
        return cleaned_text
    
    except Exception as e:
        print(f"Error parsing document: {str(e)}")
        return None


def extract_text_from_pdf(file_path: str) -> Optional[str]:
    """
    Extract text from a PDF file.
    
    Args:
        file_path (str): Path to the PDF file
    
    Returns:
        str: Raw text extracted from PDF
        None: If extraction fails
    """
    
    # Check if PyPDF2 library is available
    if PyPDF2 is None:
        print("Error: PyPDF2 library not installed. Install with: pip install PyPDF2")
        return None
    
    try:
        text = ""
        
        # Open the PDF file in binary read mode
        with open(file_path, 'rb') as file:
            # Create a PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Loop through all pages and extract text
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text()
        
        return text
    
    except Exception as e:
        print(f"Error reading PDF: {str(e)}")
        return None


def extract_text_from_docx(file_path: str) -> Optional[str]:
    """
    Extract text from a DOCX file.
    
    Args:
        file_path (str): Path to the DOCX file
    
    Returns:
        str: Raw text extracted from DOCX
        None: If extraction fails
    """
    
    # Check if python-docx library is available
    if Document is None:
        print("Error: python-docx library not installed. Install with: pip install python-docx")
        return None
    
    try:
        # Open the DOCX file
        doc = Document(file_path)
        
        # Extract text from all paragraphs
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        
        return text
    
    except Exception as e:
        print(f"Error reading DOCX: {str(e)}")
        return None


def extract_text_from_txt(file_path: str) -> Optional[str]:
    """
    Extract text from a TXT file.
    
    Args:
        file_path (str): Path to the TXT file
    
    Returns:
        str: Raw text from TXT file
        None: If extraction fails
    """
    
    try:
        # Open and read the text file with UTF-8 encoding
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()
        
        return text
    
    except UnicodeDecodeError:
        # Try with a different encoding if UTF-8 fails
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                text = file.read()
            return text
        except Exception as e:
            print(f"Error reading TXT file: {str(e)}")
            return None
    
    except Exception as e:
        print(f"Error reading TXT file: {str(e)}")
        return None


def clean_text(text: str) -> str:
    """
    Clean extracted text by removing extra whitespace and special characters.
    
    Args:
        text (str): Raw text to clean
    
    Returns:
        str: Cleaned text
    """
    
    # Replace multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep letters, numbers, and basic punctuation
    # This keeps: letters, numbers, spaces, periods, commas, hyphens, and parentheses
    text = re.sub(r'[^\w\s.,\-()@]', '', text)
    
    # Remove leading and trailing whitespace
    text = text.strip()
    
    return text


# Example usage (for testing purposes)
if __name__ == "__main__":
    # Test with a sample file
    sample_file = "sample_resume.pdf"  # Replace with your file path
    
    result = parse_document(sample_file)
    
    if result:
        print("Successfully parsed document!")
        print(f"Extracted text length: {len(result)} characters")
        print("\nFirst 200 characters:")
        print(result[:200])
    else:
        print("Failed to parse document")