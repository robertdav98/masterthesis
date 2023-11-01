import re
from subprocess import check_output
import os
from timeit import repeat, timeit


def calcMedian(arr):
    arr = sorted(arr)
    if len(arr) % 2 == 1:
        return arr[len(arr) // 2]
    return (arr[len(arr) // 2] + arr[len(arr) // 2 + 1]) / 2


def checkisFloat(string):
    try:
        return float(string)
    except ValueError:
        pass


def parseIdentityFromResponse(resp):
    print(resp)
    result = re.findall("did:.*", resp)[0][:-2]
    return result


def parseClaimFromResponse(resp):
    result = resp[7:-4]
    return result


def runMeasurement(command, cache):
    runs = 100
    key = command.split()[3]  # "node app -a createIdentity" -> createIdentity
    try:
        runtime = timeit(stmt="subprocess.call('{}')".format(command), setup="import subprocess", number=runs, )
        durations = repeat(stmt="subprocess.call('{}')".format(command), setup="import subprocess", number=1, repeat=runs)

        cache[key + "_median"] = calcMedian(durations)
        runtime = checkisFloat(runtime)
        if runtime:
            cache[key + "_average"] = runtime
    except:
        pass  # the error here can be ignored


# define commands
create_identity_command = "node app -a createIdentity"
get_identities_command = "node app -a getIdentity"
create_claim_command = "node app -a createClaim -v {} -y {} -i {}"
get_claim_command = "node app -a getClaimQR -c {} -i {}"

# prepare enviroment
os.chdir("../Issuer")
first_identifier = parseIdentityFromResponse(check_output(create_identity_command))
first_claim = parseClaimFromResponse(check_output(create_claim_command.format("Truck", "2000", first_identifier)))

cache = {}
runMeasurement(create_identity_command, cache)
runMeasurement(get_identities_command, cache)
runMeasurement(create_claim_command.format("Truck", "2000", first_identifier), cache)
runMeasurement(get_claim_command.format(first_claim, first_identifier), cache)

for k, v in sorted(cache.items()):
    print(k + ", " + str(v))
