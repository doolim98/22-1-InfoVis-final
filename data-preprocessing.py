import csv
import argparse

parser = argparse.ArgumentParser()

parser.add_argument("-i", "--input")
parser.add_argument("-o", "--output")
parser.add_argument("-r", "--reduce", type=int, default=0)

args = parser.parse_args()

csv_reader = csv.reader(open(args.input, 'r'))
csv_writer = csv.writer(open(args.output, 'w'))
csv_reduce = args.reduce

labels = []
for line in csv_reader:
    ln = csv_reader.line_num
    if ln == 1:
        labels = line.copy()
        print(labels)
    elif csv_reduce != 0 and (ln % csv_reduce) == 0:
        continue  # do not write
    del line[labels.index('content')]
    csv_writer.writerow(line)
