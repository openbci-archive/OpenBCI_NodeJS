import json
import sys
import numpy as np
import time
import zmq


class Interface:
    def __init__(self, verbose=False):
        self._context = zmq.Context()
        self._socket = self._context.socket(zmq.PAIR)
        self._socket.connect("tcp://localhost:3004")

        self.verbose = verbose

        if self.verbose:
            print "Client Ready!"

        # Send a quick message to tell node process we are up and running
        self.send(json.dumps({
            'action': 'started',
            'command': 'status',
            'message': time.time()*1000.0
        }))

    def send(self, msg):
        """
        Sends a message to TCP server
        :param msg: str
            A string to send to node TCP server, could be a JSON dumps...
        :return: None
        """
        if self.verbose:
            print '<- out ' + msg
        self._socket.send(msg)
        return

    def recv(self):
        """
        Checks the ZeroMQ for data
        :return: str
            String of data
        """
        return self._socket.recv()

    def close(self):
        """
        Closes the zmq context
        """
        self._backend.close()
        self._context.term()


class RingBuffer(np.ndarray):
    """A multidimensional ring buffer."""

    def __new__(cls, input_array):
        obj = np.asarray(input_array).view(cls)
        return obj

    def __array_finalize__(self, obj):
        if obj is None:
            return

    def __array_wrap__(self, out_arr, context=None):
        return np.ndarray.__array_wrap__(self, out_arr, context)

    def append(self, x):
        """Adds element x to the ring buffer."""
        x = np.asarray(x)
        self[:, :-1] = self[:, 1:]
        self[:, -1] = x


def main(argv):
    nb_chan = 8
    verbose = True

    # Create a new python interface.
    interface = Interface(verbose=verbose)
    # Signal buffer
    signal = RingBuffer(np.zeros((nb_chan + 1, 2500)))
    try:
        while True:
            msg = interface.recv()
            print "woo"
            try:
                dicty = json.loads(msg)
                action = dicty.get('action')
                command = dicty.get('command')
                message = dicty.get('message')

                if command == 'sample':
                    if action == 'process':
                        # Do sample processing here
                        try:
                            if type(message) is not dict:
                                print "sample is not a dict", message
                                raise ValueError
                            # Get keys of sample
                            data = np.zeros(nb_chan + 1)

                            data[:-1] = message.get('channelData')
                            data[-1] = message.get('timeStamp')

                            # Add data to end of ring buffer
                            signal.append(data)

                            print message.get('sampleNumber')
                        except ValueError as e:
                            print e
                elif command == 'status':
                    if action == 'active':
                        interface.send(json.dumps({
                            'action': 'alive',
                            'command': 'status',
                            'message': time.time() * 1000.0
                        }))
            except KeyboardInterrupt:
                print "W: interrupt received, stopping"
                print("Python ZMQ Link Clean Up")
                interface.close()
                raise ValueError("Peace")
    except BaseException as e:
        print e


if __name__ == '__main__':
    main(sys.argv[1:])