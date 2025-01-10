#!/bin/bash
JAVA_HOME="/usr/lib/jvm/java-8-oracle"

command=$1
argument1=$2

if [ $command=="start" ]; then
    if [ $argument1=="backend" ]; then
        cd improver && mvn spring-boot:run
    elif [ $argument1=="frontend" ]; then
        cd browser &&  npm run serve
    else
        echo Starting Improver project...
        (cd improver; mvn spring-boot:run) &
        (cd ../browser; npm run serve)
    fi
fi

if $command=="stop"; then
    echo Stopping Improver project...
fi

if $command=="install";  then
    echo Installing Improver project...
    mvnw clean install
fi

if $command=="ssl"; then
    echo Generating Ssl Key

    if [ -d ssl ]; then
        rm -rf ssl
        mkdir ssl
    else
            mkdir ssl
    fi
    cd ssl
    sudo chmod 777 $JAVA_HOME/jre/lib/security/cacerts
    keytool -genkeypair -alias improver -keyalg RSA -sigalg SHA1withRSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12 -validity 3650 -storepass password -dname "CN=Home Improve, OU=Dev, O=Home Improve LLC, L=New York, ST=New York, C=US"
    keytool -export -keystore keystore.p12 -alias improver -storepass password -file improver.crt
    keytool -importcert -storepass changeit -noprompt -alias improver -keystore "%JAVA_HOME%"/jre/lib/security/cacerts -trustcacerts -file improver.crt
    keytool -list -storepass changeit -keystore "%JAVA_HOME%"/jre/lib/security/cacerts -alias improver
fi


