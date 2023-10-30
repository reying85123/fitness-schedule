import Swal from 'sweetalert2'

const alertModal = async (type, text) => {
  let confirmBtnColor = type === 'error' ? '#991b1b' : '#0E7490'

  await Swal.fire({
    text: text,
    confirmButtonText: '確定',
    confirmButtonColor: confirmBtnColor,
    customClass: {
      confirmButton: 'px-[20px] py-[5px]',
      htmlContainer: '!text-slate-600 !font-semibold'
    }
  })
}

export { alertModal }
