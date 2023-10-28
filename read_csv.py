import csv

org = {}
with open('general_data.csv') as csv_file:
		reader = csv.reader(csv_file, delimiter=',')
		count = 0
		for row in reader:
				if count == 0:
						headers = row
						print(row)
				else:
						for i in range(len(headers)):
								header = headers[i]
								value = row[i]
								match header:
										case

