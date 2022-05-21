import csv
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input")
parser.add_argument("-o", "--output")
parser.add_argument("-p", "--print")

args = parser.parse_args()

csv_reader = csv.reader(open(args.input, 'r'))
csv_writer = csv.writer(open(args.output, 'w'))

labels = []
for line in csv_reader:
    if csv_reader.line_num == 1:
        labels = line
        print(labels)
    else:
        del line[labels.index('content')]
        csv_writer.writerow(line)
