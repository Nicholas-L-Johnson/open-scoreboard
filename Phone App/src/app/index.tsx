import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import {
    FlatList,
    NativeEventEmitter,
    NativeModules,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View
} from 'react-native';

import { useGlobalContext } from "../../context/GlobalProvider";

import { Colors } from 'react-native/Libraries/NewAppScreen';

import BleManager, {
    BleDisconnectPeripheralEvent,
    BleManagerDidUpdateValueForCharacteristicEvent,
    BleScanCallbackType,
    BleScanMatchMode,
    BleScanMode,
    Peripheral,
    PeripheralInfo,
} from 'react-native-ble-manager';

import { router } from 'expo-router';
import CustomButton from '../../components/CustomButton';

const SECONDS_TO_SCAN_FOR = 10;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
let intervalID2: NodeJS.Timeout;


declare module 'react-native-ble-manager' {
    // enrich local contract with custom state properties needed by App.tsx
    interface Peripheral {
        connected?: boolean;
        connecting?: boolean;
    }
}
const prefix = Linking.createURL('/');
export default function App() {
    const {
        isConnected, setIsConnected,
        leftScore, setLeftScore,
        rightScore, setRightScore,
        expectedLeftScore, setExpectedLeftScore,
        expectedRightScore, setExpectedRightScore,
        isScanning, setIsScanning,
        peripheralId, setPeripheralId,
        peripherals, setPeripherals,
        bleManagerEmitter2, setBleManagerEmitter2,
        timerMinutes, setTimerMinutes,
        timerSeconds, setTimerSeconds,
        timerStarted, setTimerStarted,
        alarmHour, setAlarmHour,
        alarmMinute, setAlarmMinute,
        alarmOn, setAlarmOn,
        hour, setHour,
        minute, setMinute,
        militaryTime, setMilitaryTime,
    } = useGlobalContext();
    const linking = {
        prefixes: [prefix],
    };


    const startScan = async () => {
        if (!isScanning && !isConnected) {
            enableBluetooth();
            // reset found peripherals before scan
            setPeripherals(new Map<Peripheral['id'], Peripheral>());

            try {
                console.debug('[startScan] starting scan...');
                setIsScanning(true);
                await BleManager.scan([], 10, true)
                    .then(() => {
                        console.debug('[startScan] scan promise returned successfully.');
                    })
                    .catch((err: any) => {
                        console.error('[startScan] ble scan returned in error', err);
                    });
            } catch (error) {
                console.error('[startScan] ble scan error thrown', error);
            }
        }
    };

    const startCompanionScan = () => {
        setPeripherals(new Map<Peripheral['id'], Peripheral>());
        try {
            console.debug('[startCompanionScan] starting companion scan...');
            BleManager.companionScan(SERVICE_UUIDS, { single: false })
                .then((peripheral: Peripheral | null) => {
                    console.debug('[startCompanionScan] scan promise returned successfully.', peripheral);
                    if (peripheral != null) {
                        setPeripherals(map => {
                            return new Map(map.set(peripheral.id, peripheral));
                        });
                    }
                })
                .catch((err: any) => {
                    console.debug('[startCompanionScan] ble scan cancel', err);
                });
        } catch (error) {
            console.error('[startCompanionScan] ble scan error thrown', error);
        }
    }

    const enableBluetooth = async () => {
        try {
            console.debug('[enableBluetooth]');
            await BleManager.enableBluetooth();
        } catch (error) {
            console.error('[enableBluetooth] thrown', error);
        }
    }

    const handleStopScan = () => {
        setIsScanning(false);
        console.debug('[handleStopScan] scan is stopped.');
    };

    const handleDisconnectedPeripheral = (
        event: BleDisconnectPeripheralEvent,
    ) => {
        console.debug(
            `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`,
        );
        if (JSON.stringify(peripherals, null, 4) == "{}") {
            setIsConnected(false);
            router.push("/")

        }
        setPeripherals(map => {
            let p = map.get(event.peripheral);
            if (p) {
                p.connected = false;
                return new Map(map.set(event.peripheral, p));
            }
            return map;
        });
        console.log(JSON.stringify(peripherals, null, 4));
    };

    const handleConnectPeripheral = (event: any) => {
        console.log(`[handleConnectPeripheral][${event.peripheral}] connected.`);
        setIsConnected(true);
    };

    const handleUpdateValueForCharacteristic = (
        data: BleManagerDidUpdateValueForCharacteristicEvent,
    ) => {
        console.debug(
            `[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}'`,
        );
    };

    const handleDiscoverPeripheral = (peripheral: Peripheral) => {
        // console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
        if (peripheral.name && peripheral.name.substring(0, 15) == "Open Scoreboard") {
            setPeripherals(map => {
                console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
                return new Map(map.set(peripheral.id, peripheral));
            });
        }
        else { }

    };

    const togglePeripheralConnection = async (peripheral: Peripheral) => {
        if (peripheral && peripheral.connected) {
            try {
                await BleManager.disconnect(peripheral.id);
            } catch (error) {
                console.error(
                    `[togglePeripheralConnection][${peripheral.id}] error when trying to disconnect device.`,
                    error,
                );
            }
        } else {
            await connectPeripheral(peripheral);
        }
    };

    const retrieveConnected = async () => {
        try {
            const connectedPeripherals = await BleManager.getConnectedPeripherals();
            if (connectedPeripherals.length === 0) {
                console.warn('[retrieveConnected] No connected peripherals found.');
                return;
            }

            console.debug(
                '[retrieveConnected]', connectedPeripherals.length, 'connectedPeripherals',
                connectedPeripherals,
            );

            for (let peripheral of connectedPeripherals) {
                setPeripherals(map => {
                    let p = map.get(peripheral.id);
                    if (p) {
                        p.connected = true;
                        return new Map(map.set(p.id, p));
                    }
                    return map;
                });
            }
        } catch (error) {
            console.error(
                '[retrieveConnected] unable to retrieve connected peripherals.',
                error,
            );
        }
    };

    const retrieveServices = async () => {
        const peripheralInfos: PeripheralInfo[] = [];
        for (let [peripheralId, peripheral] of peripherals) {
            if (peripheral.connected) {
                const newPeripheralInfo = await BleManager.retrieveServices(peripheralId);
                peripheralInfos.push(newPeripheralInfo);
            }
        }
        return peripheralInfos;
    };

    const readCharacteristics = async () => {
        let services = await retrieveServices();
        console.debug("try To Get Services");

        for (let peripheralInfo of services) {
            peripheralInfo.characteristics?.forEach(async c => {
                try {
                    const value = await BleManager.read(peripheralInfo.id, c.service, c.characteristic);
                    console.log("[readCharacteristics]", "peripheralId", peripheralInfo.id, "service", c.service, "char", c.characteristic, "\n\tvalue", value);
                } catch (error) {
                    console.error("[readCharacteristics]", "Error reading characteristic", error);
                }
            });
        }
    }

    const getAssociatedPeripherals = async () => {
        try {
            const associatedPeripherals = await BleManager.getAssociatedPeripherals();
            console.debug(
                '[getAssociatedPeripherals] associatedPeripherals',
                associatedPeripherals,
            );

            for (let peripheral of associatedPeripherals) {
                setPeripherals(map => {
                    return new Map(map.set(peripheral.id, peripheral));
                });
            }
        } catch (error) {
            console.error(
                '[getAssociatedPeripherals] unable to retrieve associated peripherals.',
                error,
            );
        }
    }

    const connectPeripheral = async (peripheral: Peripheral) => {
        try {
            if (peripheral) {
                setPeripherals(map => {
                    let p = map.get(peripheral.id);
                    if (p) {
                        p.connecting = true;
                        return new Map(map.set(p.id, p));
                    }
                    return map;
                });

                await BleManager.connect(peripheral.id);
                setPeripheralId(peripheral.id);
                router.push("/scoreboard")
                console.debug(`[connectPeripheral][${peripheral.id}] connected.`);
                setPeripherals(map => {
                    let p = map.get(peripheral.id);
                    if (p) {
                        p.connecting = false;
                        p.connected = true;
                        return new Map(map.set(p.id, p));
                    }
                    return map;
                });

                // before retrieving services, it is often a good idea to let bonding & connection finish properly
                await sleep(900);

                /* Test read current RSSI value, retrieve services first */
                const peripheralData = await BleManager.retrieveServices(peripheral.id);
                console.debug(
                    `[connectPeripheral][${peripheral.id}] retrieved peripheral services`,
                    peripheralData,
                );

                setPeripherals(map => {
                    let p = map.get(peripheral.id);
                    if (p) {
                        return new Map(map.set(p.id, p));
                    }
                    return map;
                });

                const rssi = await BleManager.readRSSI(peripheral.id);
                console.debug(
                    `[connectPeripheral][${peripheral.id}] retrieved current RSSI value: ${rssi}.`,
                );

                if (peripheralData.characteristics) {
                    for (let characteristic of peripheralData.characteristics) {
                        if (characteristic.descriptors) {
                            for (let descriptor of characteristic.descriptors) {
                                try {
                                    let data = await BleManager.readDescriptor(
                                        peripheral.id,
                                        characteristic.service,
                                        characteristic.characteristic,
                                        descriptor.uuid,
                                    );
                                    console.debug(
                                        `[connectPeripheral][${peripheral.id}] ${characteristic.service} ${characteristic.characteristic} ${descriptor.uuid} descriptor read as:`,
                                        data,
                                    );
                                } catch (error) {
                                    console.error(
                                        `[connectPeripheral][${peripheral.id}] failed to retrieve descriptor ${descriptor} for characteristic ${characteristic}:`,
                                        error,
                                    );
                                }
                            }
                        }
                    }
                }

                setPeripherals(map => {
                    let p = map.get(peripheral.id);
                    if (p) {
                        p.rssi = rssi;
                        return new Map(map.set(p.id, p));
                    }
                    return map;
                });

                BleManager.startNotification(peripheral.id, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351")
                BleManager.write(peripheral.id, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x06, new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()]);
                BleManager.write(peripheral.id, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x11]);
                // navigation.navigate('PeripheralDetails', {
                //   peripheralData: peripheralData,
                // });
            }
        } catch (error) {
            console.error(
                `[connectPeripheral][${peripheral.id}] connectPeripheral error`,
                error,
            );
        }
    };

    function sleep(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }

    useEffect(() => {
        const initBle = async () => {
            await handleAndroidPermissions();
            try {
                await BleManager.start({ showAlert: false })
                    .then(() => console.debug('BleManager started.'))
                    .catch((error: any) =>
                        console.error('BeManager could not be started.', error),
                    );
            } catch (error) {
                console.error('unexpected error starting BleManager.', error);
                return;
            }
            console.log('BleManagerModule:', BleManagerModule);

            const listeners: any[] = [
                BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
                BleManager.onStopScan(handleStopScan),
                BleManager.onConnectPeripheral(handleConnectPeripheral),
                // BleManager.onDidUpdateValueForCharacteristic(
                //     handleUpdateValueForCharacteristic
                // ),
                BleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),

                // bleManagerEmitter.addListener(
                //     'BleManagerDidUpdateValueForCharacteristic',
                //     handleUpdateValueForCharacteristic,
                // ),
            ];

            bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({ value, peripheral, characteristic, service }) => {
                switch (value[0]) {
                    case 0x00:
                        setRightScore(value[1])
                        break;
                    case 0x01:
                        setLeftScore(value[1])
                        break;
                    case 0x06:
                        setAlarmHour(value[1])
                        break;
                    case 0x07:
                        setAlarmMinute(value[1])
                        break;
                    case 0x08:
                        if (value[1] > -1) {
                            setTimerMinutes(value[1])
                        }

                        break;
                    case 0x09:
                        if (value[1] > -1) {
                            setTimerSeconds(value[1])
                        }
                        break;
                    case 0x0A:
                        setTimerStarted(value[1])
                        break;
                    case 0x1A:
                        setHour(value[1])
                        break;
                    case 0x1B:
                        setMinute(value[1])
                        break;
                    case 0x04:
                        setMilitaryTime(value[1])
                        break;

                    default:
                        console.log("default")
                        break;
                }
            })

            console.debug('BLE listeners registered');

            await handleAndroidPermissions();

            await startScan();

            return () => {
                console.debug('[app] main component unmounting. Removing listeners...');
                for (const listener of listeners) {
                    listener.remove();
                }
            };
        };
        initBle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAndroidPermissions = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]).then(result => {
                if (result) {
                    console.debug(
                        '[handleAndroidPermissions] User accepts runtime permissions android 12+',
                    );
                } else {
                    console.error(
                        '[handleAndroidPermissions] User refuses runtime permissions android 12+',
                    );
                }
            });
        } else if (Platform.OS === 'android' && Platform.Version >= 23) {
            await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ).then(checkResult => {
                if (checkResult) {
                    console.debug(
                        '[handleAndroidPermissions] runtime permission Android <12 already OK',
                    );
                } else {
                    console.debug("request fine location")
                    PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ).then(requestResult => {
                        if (requestResult) {
                            console.debug(
                                '[handleAndroidPermissions] User accepts runtime permission android <12',
                            );
                        } else {
                            console.error(
                                '[handleAndroidPermissions] User refuses runtime permission android <12',
                            );
                        }
                    });
                }
            });
        }
    };

    const renderItem = ({ item }: { item: Peripheral }) => {
        const backgroundColor = item.connected ? '#FFA500' : '#304a57';
        return (
            <TouchableHighlight
                underlayColor="#0082FC"
                className='bg-primary'
                onPress={() => togglePeripheralConnection(item)}>
                <View className='flex items-center bg-gray-700 rounded-md pt-4 pb-4 ml-4 mr-4'>
                    <Text className='font-pregular text-xl'>
                        {item.connecting ? ' - Connecting...' : item.name}
                    </Text>
                </View >
            </TouchableHighlight >
        );
    };

    return (
        <SafeAreaView className='bg-primary h-[100%] flex justify-center'>
            <View className='h-[30%] border-[1px] border-white ml-2 mr-2 rounded-2xl pt-3 pl-1 pr-1'>
                <FlatList
                    data={Array.from(peripherals.values())}
                    contentContainerStyle={{ rowGap: 12 }}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            </View>
            <CustomButton
                title="Show Scoreboard"
                handlePress={startScan}
                containerStyles='mt-7 w-[90%] mx-4 bg-blue-500'
                textStyles={'text-3xl'} isLoading={false} handleLongPress={undefined} />
        </SafeAreaView>
    );
};

const boxShadow = {
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
};

const styles = StyleSheet.create({
    engine: {
        position: 'absolute',
        right: 10,
        bottom: 0,
        color: Colors.black,
    },
    buttonGroup: {
        flexDirection: 'row',
        width: '100%'
    },
    scanButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#0a398a',
        margin: 10,
        borderRadius: 12,
        flex: 1,
        ...boxShadow,
    },
    scanButtonText: {
        fontSize: 16,
        letterSpacing: 0.25,
        color: Colors.white,
    },
    body: {
        backgroundColor: '#0082FC',
        flex: 1,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
    peripheralName: {
        fontSize: 16,
        textAlign: 'center',
        padding: 10,
    },
    rssi: {
        fontSize: 12,
        textAlign: 'center',
        padding: 2,
    },
    peripheralId: {
        fontSize: 12,
        textAlign: 'center',
        padding: 2,
        paddingBottom: 20,
    },
    row: {
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 20,
        ...boxShadow,
    },
    noPeripherals: {
        margin: 10,
        textAlign: 'center',
        color: Colors.white,
    },
});
