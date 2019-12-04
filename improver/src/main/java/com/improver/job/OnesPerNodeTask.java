package com.improver.job;

public interface OnesPerNodeTask {

    /**
     * The lock will be held at least for X millis. Can be used if you really need to execute the task
     * at most once in given period of time. If the duration of the task is shorter than clock difference between nodes, the task can
     * be theoretically executed more than once (one node after another). By setting this parameter, you can make sure that the
     * lock will be kept at least for given period of time.
     */
    long MAX_CLOCK_DIFF_BETWEEN_NODES = 1000; // 1 sec

    /**
     * How long (in ms) the lock should be kept in case the machine which obtained the lock died before releasing it.
     * This is just a fallback, under normal circumstances the lock is released as soon the tasks finishes. Negative
     * value means default (1 hour)
     *
     * Ignored when using ZooKeeper and other lock providers which are able to detect dead node.
     */
    long MAX_TASK_DELAY = 60000; // 1 min
}
