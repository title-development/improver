@echo off
set command=%1
set argument1=%2

if "%command%"=="start"  (
    if "%argument1%"=="backend" (
        cd improver
        start cmd /k mvn spring-boot:run
        cd..
    ) else if "%argument1%"=="frontend" (
        cd browser
        start cmd /k npm run serve
        cd..
    ) else (
        echo Starting Improver project...
        cd improver
        start cmd /k mvn spring-boot:run
        cd..
        cd browser
        start cmd /k npm run serve
        cd..
    )
)

if "%command%"=="stop" (
    echo Stopping Improver project...
)

if "%command%"=="install"  (
    echo Installing Improver project...
    mvnw clean install
)

if "%command%"=="ssl" (
    echo Generating sel-signed SSL certificate

    cd improver/src/main/resources
    if exist ssl (
        del ssl
        mkdir ssl
    ) else (
        mkdir ssl
    )
    cd ssl
    keytool -genkeypair -alias improver -keyalg RSA -sigalg SHA1withRSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12 -validity 3650 -storepass password -dname "CN=Home Improve, OU=Dev, O=Home Improve LLC, L=New York, ST=New York, C=US"
    keytool -export -keystore keystore.p12 -alias improver -storepass password -file improver.crt
REM    keytool -importcert -storepass changeit -noprompt -alias improver -keystore "%JAVA_HOME%"/jre/lib/security/cacerts -trustcacerts -file improver.crt
REM    keytool -list -storepass changeit -keystore "%JAVA_HOME%"/jre/lib/security/cacerts -alias improver
    D:
)
