# -*- coding: utf-8 -*-
import numpy as np
import csv
import unidecode

from sklearn.feature_extraction.text import CountVectorizer

def load_csv(path):
	data = []
	f = open(path,'r')
	reader = csv.reader(f)
	for row in reader:
		data.append(row)    
	return data[1:-2]

def write_csv(path,data,header):
	ofile  = open(path, "wb")
	ofile.write(",".join(header) + '\n')
	writer = csv.writer(ofile, delimiter=',', quotechar='"', quoting=csv.QUOTE_NONNUMERIC)

	for row in data:
		writer.writerow(row)

def decode(s):
	return unidecode.unidecode(unicode(l[-1],encoding='utf8'))

data = load_csv("discursos_original.csv")
for d in data:
	d[-1] = unidecode.unidecode(unicode(d[-1],encoding='utf8')).lower()
	d[3] = unidecode.unidecode(unicode(d[3],encoding='utf8')).upper()
discursos = [l[-1] for l in data]

stop = ['da','de','para','em','eu','do','meu','nao','sim','por','pelo','minha',
		'que','sr','pela','um','com','os','nome','dos','uma','na','pelos',
		'aqui','nos','esta','no','ao','me','meus','as','se','das','todos','este',
		'quero','aos','hoje','sao','mas','tem','como','neste','estao','dizer',
		'isso','srs','sras','mais','nossa','esse','grande','porque','sou','sem',
		'desse','muitos','nossa','ele','voce','nosso','ser','nas','toda','seu','10',
		'mim','estou','ha','contra']

vectorizer = CountVectorizer(stop_words=stop, ngram_range=(1, 1),min_df=10)
X = vectorizer.fit_transform(discursos).toarray()
count = np.sum(X,axis=0)
arg_count_ord = np.argsort(count)[::-1]
# print arg_count_ord
ord_count = count[arg_count_ord]
ord_words = [vectorizer.get_feature_names()[i] for i in arg_count_ord]
# print ord_words[:30]
# exit()
# new_data = [list(z) for z in zip(ord_words,ord_count)]

# print ord_words
new_data = []
for w in ord_words[:30]:
	for r,d in zip(X,data):
		# print w
		# print r
		# print d
		# print 
		if d[3] == 'NAO' or d[3] == 'SIM':
			i = vectorizer.vocabulary_[w]
			l = [w,r[i],d[-1].count(w),d[0],d[1].upper(),d[2].upper(),d[3].upper(),d[4].upper()]
			new_data.append(l)

header = ['word','countUni','count','name','party','state','vote','sex']
write_csv('data_words.csv',new_data,header)
# print new_data
# print vectorizer.stop_words_
# print vectorizer.vocabulary_[vectorizer.get_feature_names()[232]]

