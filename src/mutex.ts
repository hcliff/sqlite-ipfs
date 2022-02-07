export type Mutex = SharedArrayBuffer

const unlocked = 0
const locked = 1

export function unlock(m: Mutex) {
    const int32 = new Int32Array(m);
    const oldValue = Atomics.compareExchange(int32, 0, locked, unlocked);
    // if the mutex was locked then notify subscribers
    if(oldValue !== locked){
        throw new Error("already unlocked")
    }
    Atomics.notify(int32, 0);
}

// TODO: timeout doesn't account for retries
export function lock(m: Mutex, timeout?: number): "ok" | "not-equal" | "timed-out" {
    const int32 = new Int32Array(m);
    for(;;){
        // sleep until the index is _not_ locked
        const wait = Atomics.wait(int32, 0, locked, timeout);
        const oldValue = Atomics.compareExchange(int32, 0, unlocked, locked);
        // if someone else aquired the lock, retry the operation
        if(oldValue === locked){
            continue;
        }
        return wait;
    }
}

export function waitForLock(m: Mutex, timeout?: number): "ok" | "not-equal" | "timed-out" {
    const int32 = new Int32Array(m);
    // sleep until the index is _not_ locked
    return Atomics.wait(int32, 0, locked, timeout);
}