export const extractFeature = {
	fetch(request) {
		return request.cf as cf;
	},
	feat(request: Request) {
		return {
			ip: request.headers.get('CF-Connecting-IP'),
			user_agent: request.headers.get('user-agent'),
			...this.fetch(request)
		};
	}
};
type cf = {
	longitude: '-111.81700';
	httpProtocol: 'HTTP/1.1';
	tlsCipher: '';
	continent: 'NA';
	asn: 209;
	clientAcceptEncoding: 'gzip, br';
	country: 'US';
	tlsClientExtensionsSha1: '';
	verifiedBotCategory: '';
	tlsClientAuth: {
		certIssuerDNLegacy: '';
		certIssuerSKI: '';
		certSubjectDNRFC2253: '';
		certSubjectDNLegacy: '';
		certFingerprintSHA256: '';
		certNotBefore: '';
		certSKI: '';
		certSerial: '';
		certIssuerDN: '';
		certVerified: 'NONE';
		certNotAfter: '';
		certSubjectDN: '';
		certPresented: '0';
		certRevoked: '0';
		certIssuerSerial: '';
		certIssuerDNRFC2253: '';
		certFingerprintSHA1: '';
	};
	tlsVersion: '';
	city: 'Gilbert';
	timezone: 'America/Phoenix';
	colo: 'LAX';
	tlsClientHelloLength: '';
	edgeRequestKeepAliveStatus: 1;
	postalCode: '85233';
	region: 'Arizona';
	latitude: '33.33490';
	requestPriority: '';
	regionCode: 'AZ';
	asOrganization: 'CenturyLink';
	metroCode: '753';
	tlsClientRandom: '';
};
