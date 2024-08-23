$(document).ready(function() {
    // Mostrar popup de política de privacidad
    // const privacyPolicy = `
    //     <div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true">
    //         <div class="modal-dialog">
    //             <div class="modal-content">
    //                 <div class="modal-header">
    //                     <h5 class="modal-title" id="privacyModalLabel">Política de Privacidad y Uso de Datos</h5>
    //                     <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    //                 </div>
    //                 <div class="modal-body">
    //                     <p>En nuestra web, nos tomamos muy en serio la privacidad y seguridad de los datos de nuestros usuarios. Queremos asegurarte que los datos proporcionados en nuestro sitio no se almacenan en ningún momento. Toda la información que nos proporcionas se utiliza exclusivamente para generar las listas solicitadas, y una vez cumplido este propósito, los datos se eliminan de inmediato de nuestros sistemas.</p>
    //                     <p>Asimismo, al enviar correos electrónicos a través de nuestra plataforma, estos se procesan de manera directa y no se guarda ninguna copia de los mismos. De esta forma, garantizamos que la información contenida en los correos se mantenga segura y privada.</p>
    //                     <p>Nuestro compromiso es ofrecerte un servicio eficiente, respetando siempre tu privacidad y protegiendo tus datos personales. Si tienes alguna pregunta o inquietud, no dudes en contactarnos.</p>
    //                     <p><strong>info@tareas.nredes.dev</strong></p>
    //                 </div>
    //                 <div class="modal-footer">
    //                     <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // `;
    // $('body').append(privacyPolicy);
    // $('#privacyModal').modal('show');

    $('#participantForm').on('submit', function(event) {
        event.preventDefault();
        const email = $('#email').val();
        const alias = $('#alias').val().toUpperCase();
        const participantCount = $('#participantList li').length;

        if (participantCount < 10) {
            const participantItem = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${alias} (${email})
                    <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
                </li>
            `;
            $('#participantList').append(participantItem);
            $('#email').val('');
            $('#alias').val('');
        } else {
            alert('No se pueden agregar más de 10 participantes.');
        }
    });

    $('#participantList').on('click', '.delete-btn', function() {
        $(this).closest('li').remove();
    });

    // Cargar tareas desde tareas.php usando AJAX
    $.ajax({
        url: './php/tareas.php',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            data.forEach(function(task) {
                const taskItem = `
                    <li class="list-group-item task-item">${task.descripcion_tarea}</li>
                `;
                $('#availableTasks').append(taskItem);
            });
        },
        error: function() {
            alert('Error al cargar las tareas.');
        }
    });

    // Mover tarea a la lista de tareas seleccionadas
    $('#availableTasks').on('click', '.task-item', function() {
        $(this).appendTo('#selectedTasks');
    });

    // Mover tarea de vuelta a la lista de tareas disponibles
    $('#selectedTasks').on('click', '.task-item', function() {
        $(this).appendTo('#availableTasks');
    });

    // Generar tabla de asignación
    $('#generateTable').on('click', function() {
        const participants = [];
        $('#participantList li').each(function() {
            const alias = $(this).text().split(' (')[0];
            const email = $(this).text().split(' (')[1].slice(0, -1);
            participants.push({ alias, email });
        });

        const tasks = [];
        $('#selectedTasks li').each(function() {
            tasks.push($(this).text());
        });

        if (participants.length < 1 || tasks.length === 0) {
            alert('Debe haber al menos 1 participante y algunas tareas seleccionadas.');
            return;
        }

        // Asignar tareas aleatoriamente a los participantes
        const assignments = {};
        participants.forEach(participant => {
            assignments[participant.alias] = { email: participant.email, tasks: [] };
        });

        while (tasks.length > 0) {
            participants.forEach(participant => {
                if (tasks.length > 0) {
                    const randomIndex = Math.floor(Math.random() * tasks.length);
                    assignments[participant.alias].tasks.push(tasks.splice(randomIndex, 1)[0]);
                }
            });
        }

        // Redirigir a la nueva página con los datos de asignación
        const assignmentData = encodeURIComponent(JSON.stringify(assignments));
        window.location.href = `asignacion.html?data=${assignmentData}`;
    });
});