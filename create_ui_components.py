#!/usr/bin/env python3
"""
Script to automatically create all UI components from documentation files.
This will parse the markdown files and create all component files.
"""

import os
import re
from pathlib import Path

def extract_code_blocks(markdown_file):
    """Extract code blocks with file paths from markdown."""
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match: ### path/to/file.tsx followed by ```typescript code ```
    pattern = r'###\s+([^\n]+\.tsx)\s*\n```typescript\s*\n(.*?)\n```'
    matches = re.findall(pattern, content, re.DOTALL)
    
    return matches

def create_file_with_content(filepath, content):
    """Create a file with the given content, creating directories as needed."""
    # Remove 'src/' prefix if present in the path from markdown
    if filepath.startswith('src/'):
        filepath = filepath
    
    # Create directory if it doesn't exist
    directory = os.path.dirname(filepath)
    if directory:
        os.makedirs(directory, exist_ok=True)
    
    # Write the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Created: {filepath}")

def main():
    """Main function to process all markdown files and create components."""
    markdown_files = [
        'COMPLETE_UI_CODE.md',
        'COMPLETE_UI_CODE_PART2.md',
        'COMPLETE_UI_CODE_FINAL.md'
    ]
    
    total_created = 0
    
    print("🚀 Starting UI component creation...\n")
    
    for md_file in markdown_files:
        if not os.path.exists(md_file):
            print(f"⚠️  Warning: {md_file} not found, skipping...")
            continue
        
        print(f"📄 Processing {md_file}...")
        code_blocks = extract_code_blocks(md_file)
        
        for filepath, content in code_blocks:
            try:
                create_file_with_content(filepath, content)
                total_created += 1
            except Exception as e:
                print(f"❌ Error creating {filepath}: {e}")
        
        print()
    
    print(f"\n🎉 Complete! Created {total_created} files.")
    print("\n📋 Next steps:")
    print("1. Update src/App.tsx with new routes")
    print("2. Update src/components/navigation/HamburgerMenu.tsx")
    print("3. Run 'npm run dev' to test")
    print("4. Check for any TypeScript errors")

if __name__ == "__main__":
    main()
