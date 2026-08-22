export function Button({ variant = 'primary', className = '', ...props }) {
  return <button type="button" className={`btn btn-${variant} ${className}`.trim()} {...props} />
}
