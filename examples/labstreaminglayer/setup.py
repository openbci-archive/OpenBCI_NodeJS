from setuptools import setup, find_packages

setup(name='openbci-node-labstreaminglayer',
      version='0.0.1',
      description='Labstreaminglayer with NodeJS',
      url='',
      author='AJ Keller',
      author_email='pushtheworldllc@gmail.com',
      license='MIT',
      packages=find_packages(),
      install_requires=['numpy', 'pyzmq','pylsl'],
      zip_safe=False)
