type kind =
| Fas(string)
| Fab(string)
| Custom(string)

@react.component
let make = (~children=?, ~kind, ~large=false) => {
  let class = switch kind {
  | Fas(icon) => `fas fa-${icon}`
  | Fab(icon) => `fab fa-${icon}`
  | Custom(_) => ""
  }
  let size = switch large {
  | true => "text-3xl"
  | false => ""
  }
  let icon = <i className={`${class} ${size}`} />
  switch children {
  | None => icon
  | Some(c) => <div className="flex flex-row"> icon c </div>
  }
}
