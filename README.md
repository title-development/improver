# homeimprove.com

## How to run

* Run in root folder:
```
mvnw clean install
```
```
java -jar improver/target/improver.jar
```

* Visit [http://localhost:8443/](http://localhost:8443/)


## Setup development configuration

#### 1. Install Node.js (latest version) [https://nodejs.org](https://nodejs.org)

Download and install latest version. 

Or via **Chocolatey** run the following command:
```
choco install nodejs
```

#### 2. Install NPM and AngularCLI
Run in cmd:
```
npm install npm@latest -g
```
```
npm install -g @angular/cli
```

NOTE: in case of errors like __"/usr/bin/env: ‘node’: No such file or directory"__ 
on Linux run:
```
sudo ln -s /usr/bin/nodejs /usr/bin/node
```
#### 3. Build project

* Run in root folder:

```
mvnw clean install
```

#### 4. Run project

* For development run in root folder:

```
cd improver
mvn spring-boot:run
```

```
cd browser
npm run serve
```

#### 5. Visit [http://localhost:4200/](http://localhost:4200/)

NG Live Development Server is running on [http://localhost:4200/](http://localhost:4200/)

Java Server is running on [http://localhost:8443/](http://localhost:8443/)




## Load balancer local simulation

##### 1. Download Nginx
##### 2. Add in nginx.conf in http part

```
http {
    ...
    
    upstream improver {
        server localhost:8101;
        server localhost:8102;
        server localhost:8103;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://improver;
        }
    }
    
    ...
}
```

##### 3. Start 3 instances of server on different ports (8101, 8102, 8103) 
`java -jar improver.jar --server.port=8101`  
`java -jar improver.jar --server.port=8102`  
`java -jar improver.jar --server.port=8103`  
##### 4. Visit localhost. Now you can do any tests that requires load balancer. 


## Generate ssl certificate for live server
##### 1. Download and install openssl
##### 2. Create config file with name ssl.conf
```
[ req ]
default_bits       = 4096
distinguished_name = req_distinguished_name
req_extensions     = req_ext

[ req_distinguished_name ]
countryName                 = Country Name (2 letter code)
countryName_default         = US
stateOrProvinceName         = State or Province Name (full name)
stateOrProvinceName_default = NEW YORK
localityName                = Locality Name (eg, city)
localityName_default        = NEW YORK
organizationName            = Organization Name (eg, company)
organizationName_default    = Home Improve
commonName                  = Common Name (e.g. server FQDN or YOUR name)
commonName_max              = 64
commonName_default          = localhost

[ req_ext ]
subjectAltName = @alt_names

[alt_names]
DNS.1   = localhost

[SAN]
subjectAltName=DNS:localhost
```
##### 3. Run console command
````
openssl req -newkey rsa:2048 -x509 -nodes -keyout server.key -new -out server.crt -reqexts SAN -e
xtensions SAN -config ssl.conf -sha256 -days 3650
````
##### 4. Add generated certificate to Trusted Root Certification Authorities

##### 5. Generate pkcs12 keystore for embedded tomcat.  
_Note. Password is "password"_
````
openssl pkcs12 -export -in C:\certificates\server.crt -inkey C:\certificates\server.key -out C:\certificates\keystore.p12 -name improver -caname improver
````
