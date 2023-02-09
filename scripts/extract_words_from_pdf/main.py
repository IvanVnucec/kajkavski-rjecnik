from pdfminer.high_level import extract_text
import re
import collections

text = extract_text('sample.pdf')

words = [w.lower() for w in re.findall(r'\b\w+\b', text)]

word_counts = collections.Counter(words)
sorted_word_counts = sorted(word_counts.items(), key=lambda item: item[1], reverse=True)

for word, count in sorted_word_counts:
    print(f"{word}: {count}")
