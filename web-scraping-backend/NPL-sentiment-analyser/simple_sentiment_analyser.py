import string


# this is a rough implementation of a system that analyses sentiment in words without using machine learning

def simple_analyse(text: string):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    word_list = text.split()
    irrelevant_words = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself",
                        "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its",
                        "itself",
                        "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
                        "these",
                        "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
                        "having", "do",
                        "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
                        "while",
                        "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during",
                        "before",
                        "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over",
                        "under", "again",
                        "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both",
                        "each",
                        "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
                        "than",
                        "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]

    final_text = []
    for word in word_list:
        if word not in irrelevant_words:
            final_text.append(word)

    with open('good_words.txt', 'r') as good_words_file:
        good_words = good_words_file.read().splitlines()

    with open('bad_words.txt', 'r') as bad_words_file:
        bad_words = bad_words_file.read().splitlines()

    total = 0

    for word in final_text:
        if word in good_words:
            total = total + 1
        elif word in bad_words:
            total = total - 1

    return str(total / len(final_text))
