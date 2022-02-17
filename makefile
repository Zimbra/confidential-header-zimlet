all: zimlet

zimlet: clean
	zip -j -r com_zimbra_confidential_header.zip zimlet/com_zimbra_confidential_header/*.*

clean:
	rm -f com_zimbra_confidential_header.zip

.PHONY: all zimlet
