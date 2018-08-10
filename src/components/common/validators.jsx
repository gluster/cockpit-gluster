//values are strings unless otherwise specified

export const minLen = (value, min) => {
  return value.length >= min
}

export const notEmpty = (value) => {
  return minLen(value,1)
}
