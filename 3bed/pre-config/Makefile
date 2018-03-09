all: rvn2cumulus controlmacs

rvn2cumulus: rvn2cumulus.go
	go build -o $@ $<

controlmacs: controlmacs.go
	go build -o $@ $<

clean:
	rm -f rvn2cumulus controlmacs
