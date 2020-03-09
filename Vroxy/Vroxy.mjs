const Vroxy = {}
Vroxy.create = function (_target = {}, _handler = {}) {
  /**
  * Handler for the vroxy: returns traps with swapped target and handler
  */
  const trapTargetSwapper = new Proxy({}, {
    get (t, trapName, caller) {
      let trap = _handler[trapName] || Reflect[trapName]
      return (t, ...args) => trap(_target, ...args)
    }
  })

  const { proxy, revoke } = Proxy.revocable({}, trapTargetSwapper)

  function handler (newHandler) {
    return newHandler ? _handler = newHandler : _handler
  }
  function target (newTarget) {
    return newTarget ? _target = newTarget : _target
  }
  return { proxy, handler, target, revoke }
}

export { Vroxy }
