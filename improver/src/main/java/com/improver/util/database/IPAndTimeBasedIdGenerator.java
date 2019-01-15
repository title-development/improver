package com.improver.util.database;

import org.hibernate.MappingException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.UUIDHexGenerator;
import org.hibernate.internal.util.config.ConfigurationHelper;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.type.Type;

import java.io.Serializable;
import java.util.Properties;

/**
 * An identifier generator that returns a string of length 24 (i.e "ff8081816163934dqs3g5g5h").
 * Is constructed of hexadecimal representation of machine IP address plus its current time in milliseconds.
 */
public class IPAndTimeBasedIdGenerator extends UUIDHexGenerator {
    private String separator = "";

    public void configure(Type type, Properties params, ServiceRegistry serviceRegistry) throws MappingException {
        this.separator = ConfigurationHelper.getString("separator", params, "");
    }

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        return new StringBuffer(24)
            .append(format(getIP())).append(separator)
            .append(format(getHiTime())).append(separator)
            .append(format(getLoTime())).append(separator)
            .append(format(getCount())).append(separator)
            .toString();
    }


}
