#!/usr/bin/env bash
set -u

BASE_URL="${BASE_URL:-http://localhost:8000/api/search}"
PAUSE_SECONDS="${PAUSE_SECONDS:-2}"

requests=(
  "Paris|FR|JFK|CDG|2026-07-01|2026-07-08|2|1|6000"
  "Paris|FR|JFK|CDG|2026-08-10|2026-08-17|1|1|4500"
  "Paris|FR|YYZ|CDG|2026-09-05|2026-09-12|3|2|9000"
  "Tokyo|JP|JFK|HND|2026-07-10|2026-07-18|2|1|8500"
  "Tokyo|JP|YYZ|NRT|2026-10-03|2026-10-12|1|1|5500"
  "Tokyo|JP|LAX|HND|2026-11-01|2026-11-09|4|2|14000"
  "London|GB|JFK|LHR|2026-07-15|2026-07-22|2|1|6500"
  "London|GB|YYZ|LHR|2026-09-14|2026-09-21|1|1|4200"
  "London|GB|LAX|LHR|2026-12-02|2026-12-09|3|2|10000"
  "Rome|IT|JFK|FCO|2026-08-01|2026-08-08|2|1|6500"
  "Rome|IT|YYZ|FCO|2026-09-20|2026-09-28|4|2|12000"
  "Rome|IT|LAX|FCO|2026-10-10|2026-10-17|1|1|5000"
  "Barcelona|ES|JFK|BCN|2026-07-20|2026-07-27|2|1|6000"
  "Barcelona|ES|YYZ|BCN|2026-08-18|2026-08-25|3|2|8500"
  "Barcelona|ES|LAX|BCN|2026-11-05|2026-11-13|1|1|4800"
  "Amsterdam|NL|JFK|AMS|2026-07-04|2026-07-11|2|1|6200"
  "Amsterdam|NL|YYZ|AMS|2026-09-01|2026-09-08|1|1|4300"
  "Amsterdam|NL|LAX|AMS|2026-10-15|2026-10-23|4|2|12500"
  "Lisbon|PT|JFK|LIS|2026-08-05|2026-08-12|2|1|5600"
  "Lisbon|PT|YYZ|LIS|2026-09-10|2026-09-18|3|2|8000"
  "Lisbon|PT|LAX|LIS|2026-11-12|2026-11-20|1|1|4700"
  "Athens|GR|JFK|ATH|2026-07-25|2026-08-02|2|1|7000"
  "Athens|GR|YYZ|ATH|2026-09-17|2026-09-25|4|2|11500"
  "Athens|GR|LAX|ATH|2026-10-22|2026-10-30|1|1|5200"
  "Bali|ID|JFK|DPS|2026-08-12|2026-08-22|2|1|9000"
  "Bali|ID|YYZ|DPS|2026-10-01|2026-10-11|3|2|13000"
  "Bali|ID|LAX|DPS|2026-11-18|2026-11-28|1|1|6500"
  "Cancun|MX|JFK|CUN|2026-07-12|2026-07-19|2|1|5000"
  "Cancun|MX|YYZ|CUN|2026-08-22|2026-08-29|4|2|9000"
  "Cancun|MX|LAX|CUN|2026-12-05|2026-12-12|1|1|4200"
)

success_count=0
failure_count=0

echo "Calling ${#requests[@]} searches against: ${BASE_URL}"
echo "Successful searches will create normalized JSON files in the backend inputData folder."
echo

for index in "${!requests[@]}"; do
  IFS="|" read -r city country origin destination start_date end_date people rooms budget <<< "${requests[$index]}"
  display_index=$((index + 1))

  echo "[$display_index/${#requests[@]}] ${city}: ${origin} -> ${destination}, ${start_date} to ${end_date}, ${people} people"

  status_code="$(
    curl --silent --show-error --output /tmp/vacation-search-response.json --write-out "%{http_code}" \
      --get "${BASE_URL}" \
      --data-urlencode "city=${city}" \
      --data-urlencode "countryCode=${country}" \
      --data-urlencode "originAirport=${origin}" \
      --data-urlencode "destinationAirport=${destination}" \
      --data-urlencode "startDate=${start_date}" \
      --data-urlencode "endDate=${end_date}" \
      --data-urlencode "people=${people}" \
      --data-urlencode "rooms=${rooms}" \
      --data-urlencode "budgetCad=${budget}"
  )"

  if [[ "${status_code}" == "200" ]]; then
    success_count=$((success_count + 1))
    echo "  saved"
  else
    failure_count=$((failure_count + 1))
    echo "  failed with HTTP ${status_code}"
    sed -n '1,8p' /tmp/vacation-search-response.json
  fi

  if [[ "${display_index}" -lt "${#requests[@]}" ]]; then
    sleep "${PAUSE_SECONDS}"
  fi
done

echo
echo "Done. Successful: ${success_count}. Failed: ${failure_count}."
